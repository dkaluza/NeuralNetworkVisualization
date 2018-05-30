from app.nnvis.models import Architecture, Model, Image, Dataset
from app.nnvis.models import Trainingsample as TrainingSample
from app.nnvis.rests.protected_resource import ProtectedResource
from app.utils import fileToB64, numpyToB64
from app.vis_tools import visualize_utils
from app.vis_tools.algorithms.gradcam import GradCAM

def safe_add_is_training(feed_dict, graph, train):
    try:
        is_training = graph.get_tensor_by_name('is_training:0')
        feed_dict[is_training] = train
    except KeyError:
        pass


# inference/<int:model_id>/<int:trainsample_id>
class Inference(ProtectedResource):
    def get(self, model_id, trainsample_id):
        ts = TrainingSample.query.get(trainsample_id)
        images = sorted(ts.images, key=lambda im: im.trainsample_position)
        image_paths = [image.full_path() for image in images]

        model = Model.query.get(model_id)
        weights_path = model.weights_path
        meta_file = Architecture.query.get(model.arch_id).get_meta_file_path()
        number_of_inputs = Dataset.query.get(model.dataset_id).imgs_per_sample
        graph, sess, xs, *_ = visualize_utils.load_model(meta_file, weights_path, number_of_inputs)

        output_op = graph.get_tensor_by_name('output:0')
        image_inputs = [
            visualize_utils.load_image(image_path, xs[0].shape.as_list()[1:], proc=visualize_utils.preprocess)
            for image_path in image_paths
        ]

        image_inputs = [visualize_utils.exapnd_dim(img) for img in image_inputs]
        feed_dict = {xs[i]: image_inputs[i] for i in range(number_of_inputs)}

        safe_add_is_training(feed_dict, graph, False)
        predictions = output_op.eval(feed_dict=feed_dict, session=sess)
        predictions = predictions[0]

        sess.close()

        dataset = Dataset.query.get(model.dataset_id)
        class_names = dataset.labels.split(',')
        scores = [{'class_number': class_number,
                   'class_name': class_names[class_number],
                   'score': str(score)}
                  for class_number, score in enumerate(predictions)]
        return {'class_scores': scores}


# visualize/<int:model_id>/<int:alg_id>/<int:trainsample_id>/<int:postprocessing_id>/<int:on_image>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, trainsample_id, postprocessing_id, on_image):
        if alg_id not in visualize_utils.algorithms_register:
            return {'errormsg': "Bad algorithm id"}, 400

        if postprocessing_id not in visualize_utils.postprocessing_register:
            return {'errormsg': "Bad postprocessing id"}, 400

        ts = TrainingSample.query.get(trainsample_id)
        images = sorted(ts.images, key=lambda im: im.trainsample_position)
        image_paths = [image.full_path() for image in images]

        model = Model.query.get(model_id)
        weights_path = model.weights_path
        meta_file = Architecture.query.get(model.arch_id).get_meta_file_path()
        number_of_inputs = Dataset.query.get(model.dataset_id).imgs_per_sample
        graph, sess, xs, y, neuron_selector, *_ = visualize_utils.load_model(meta_file, weights_path, number_of_inputs)

        image_inputs = [
            visualize_utils.load_image(image_path, xs[0].shape.as_list()[1:], proc=visualize_utils.preprocess)
            for image_path in image_paths
        ]

        image_inputs = [visualize_utils.exapnd_dim(img) for img in image_inputs]

        feed_dict = {xs[i]: image_inputs[i] for i in range(number_of_inputs)}

        safe_add_is_training(feed_dict, graph, False)

        label = int(ts.label)
        feed_dict[neuron_selector] = label

        alg_class = visualize_utils.algorithms_register[alg_id]
        if alg_class == GradCAM:
            vis_algorithm = alg_class(graph, sess, y, xs, [model.last_conv_tensor_name])
        else:
            vis_algorithm = alg_class(graph, sess, y, xs)

        image_outputs = vis_algorithm.GetMask(image_inputs, feed_dict=feed_dict)

        sess.close()

        original_image_paths = [
            image_paths[i] if on_image else None
            for i in range(number_of_inputs)
        ]

        postproc_class = alg_class.postprocessings[postprocessing_id]
        saliency_maps = postproc_class.process(image_outputs, original_image_paths)
        img = visualize_utils.combine(saliency_maps)
        img = visualize_utils.downsize(img)

        img_b64 = numpyToB64(img)

        return {
            'base64': [{
                'name': 'img',
                'contentType': 'image/png'
            }],
            'img': img_b64
        }


# /image/<string:id>
class Images(ProtectedResource):
    def get(self, id):
        ts = TrainingSample.query.get(id)

        images = sorted(ts.images, key=lambda im: im.trainsample_position)
        img_paths = [image.full_path() for image in images]

        img = visualize_utils.combine(img_paths, from_paths=True)
        img = visualize_utils.downsize(img)

        img_b64 = numpyToB64(img)

        return {
            'base64': [{
                'name': 'img',
                'contentType': 'image/png'
            }],
            'img': img_b64
        }


# /images/<int:model_id>
class ImageList(ProtectedResource):
    def get(self, model_id):
        model = Model.query.get(model_id)
        trainingsamples = TrainingSample.query.filter(TrainingSample.dataset_id == model.dataset_id).all()
        return {'trainingsamples': [trainingsample.json() for trainingsample in trainingsamples]}


# /list_algorithms
class Algorithms(ProtectedResource):
    def get(self):
        return {'algorithms': [{'id': a_id, 'name': algo.name()}
                               for a_id, algo
                               in visualize_utils.algorithms_register.items()]}


# /list_postprocessing/<int:alg_id>'
class Postprocessing(ProtectedResource):
    def get(self, alg_id):
        postprocessings = visualize_utils.algorithms_register[alg_id].postprocessings
        return {'postprocessing': [{'id': p_id, 'name': postprocessing.name()}
                                   for p_id, postprocessing in postprocessings.items()]}
