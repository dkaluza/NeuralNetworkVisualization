from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Architecture, Model, Image, Dataset
from app.nnvis.models import Trainingsample as TrainingSample
from app.utils import fileToB64
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
        image_paths = [image.full_path() for image in ts.images]

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
        feed_dict = {xs[i]: image_inputs[i] for i in range(len(xs))}

        if model.name == 'BIRADS_covnet_model': # mocked super sieć Krzyśka
            noise = graph.get_tensor_by_name('gauss_noise_std:0')
            nodropout = graph.get_tensor_by_name('nodropout:0')
            wtf = graph.get_tensor_by_name('Placeholder_6:0') # nie wiem co to ale tensorflow narzekal
            feed_dict[noise] = 0.005
            feed_dict[nodropout] = 1.00
            feed_dict[wtf] = 0.0

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


# visualize/<int:model_id>/<int:alg_id>/<int:trainsample_id>/<int:trainsample_position>/<int:postprocessing_id>/<int:on_image>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, trainsample_id, trainsample_position, postprocessing_id, on_image):
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
        x = xs[trainsample_position]

        image_inputs = [
            visualize_utils.load_image(image_path, xs[0].shape.as_list()[1:], proc=visualize_utils.preprocess)
            for image_path in image_paths
        ]

        feed_dict = {xs[i]: image_inputs[i] for i in range(number_of_inputs)}

        if model.name == 'BIRADS_covnet_model':  # mocked super sieć Krzyśka
            noise = graph.get_tensor_by_name('gauss_noise_std:0')
            nodropout = graph.get_tensor_by_name('nodropout:0')
            wtf = graph.get_tensor_by_name('Placeholder_6:0')  # nie wiem co to ale tensorflow narzekal
            feed_dict[noise] = 0.005 # gdy 0 to model zwraca NaNs
            feed_dict[nodropout] = 1.0
            feed_dict[wtf] = 0.0

        safe_add_is_training(feed_dict, graph, False)

        label = int(ts.label)
        print(label)
        feed_dict[neuron_selector] = label

        alg_class = visualize_utils.algorithms_register[alg_id]
        if alg_class == GradCAM:
            if model.name == 'BIRADS_covnet_model':
                last_conv_tensor_names = ['conv5c_CC/conv5c_CC/Relu:0', 'conv5c_CC/conv5c_CC/Relu:0',
                                         'conv5c_MLO/conv5c_MLO/Relu:0', 'conv5c_MLO/conv5c_MLO/Relu:0']
                last_conv_tensor_name = last_conv_tensor_names[trainsample_position]
                vis_algorithm = alg_class(graph, sess, y, x, last_conv_tensor_name)
            else:
                vis_algorithm = alg_class(graph, sess, y, x, model.last_conv_tensor_name)
        else:
            vis_algorithm = alg_class(graph, sess, y, x)

        image_output = vis_algorithm.GetMask(image_inputs[trainsample_position], feed_dict=feed_dict)
        sess.close()

        original_image_path = image_paths[trainsample_position] if on_image else None

        postproc_class = alg_class.postprocessings[postprocessing_id]
        saliency = postproc_class.process(image_output, original_image_path)

        img_stream = visualize_utils.save_image(saliency, proc=visualize_utils.normalize_rgb)
        img_b64 = fileToB64(img_stream)
        return {
            'base64': [{
                'name': 'img',
                'contentType': 'image/png'
            }],
            'img': img_b64
        }


# /image/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        image = Image.query.get(image_id)
        img_path = image.full_path()
        with open(img_path, 'rb') as img_f:
            img_b64 = fileToB64(img_f)
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
        images = Image.query.join(TrainingSample.images).filter(TrainingSample.dataset_id == model.dataset.id).all()
        return {'images': [image.json() for image in images]}


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
