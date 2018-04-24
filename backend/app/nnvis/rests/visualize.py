import os
import shutil

from flask import current_app as app

from app.nnvis.models import Dataset
from app.nnvis.models import Image
from app.nnvis.models import Model
from app.nnvis.rests.protected_resource import ProtectedResource
from app.vis_tools import visualize_utils


# inference/<int:model_id>/<int:image_id>
class Inference(ProtectedResource):
    def get(self, model_id, image_id):
        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)

        model = Model.query.get(model_id)
        graph, sess, x, *_ = visualize_utils.load_model(model)

        output_op = graph.get_tensor_by_name('output:0')

        image_input = visualize_utils.load_image(image_path, x.shape.as_list()[1:], proc=visualize_utils.preprocess)

        predictions = output_op.eval(feed_dict={x: [image_input]}, session=sess)
        predictions = predictions[0]

        sess.close()

        dataset = Dataset.query.get(model.dataset_id)
        class_names = dataset.labels.split(',')
        scores = [{'class_number': class_number,
                   'class_name': class_names[class_number],
                   'score': str(score)}
                  for class_number, score in enumerate(predictions)]
        return {'class_scores': scores}


# visualize/<int:model_id>/<int:alg_id>/<int:image_id>/<int:on_image>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, image_id, postprocessing_id, on_image):
        if alg_id not in visualize_utils.algorithms_register:
            return {'errormsg': "Bad algorithm id"}, 400

        if postprocessing_id not in visualize_utils.postprocessing_register:
            return {'errormsg': "Bad postprocessing id"}, 400

        # get image
        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)

        # get model
        model = Model.query.get(model_id)
        graph, sess, x, y, neuron_selector, _ = visualize_utils.load_model(model)

        # get algorithm
        alg_class = visualize_utils.algorithms_register[alg_id]
        vis_algorithm = alg_class(graph, sess, y, x)

        # load image data
        original_image = visualize_utils.load_image(image_path, x.shape.as_list()[1:])

        # preprocess image data
        image_input = visualize_utils.preprocess(original_image)

        # run algorithm
        image_output = vis_algorithm.GetMask(image_input, feed_dict={neuron_selector: int(image.label)})
        sess.close()

        # get postprocessing
        if not on_image:
            original_image = None
        postproc_class = visualize_utils.postprocessing_register[postprocessing_id]
        postproc = postproc_class()
        image_output = postproc.process(image_output, original_image)

        # save image
        sufix = '_' + alg_class.__name__ + '_' + postproc_class.__name__ + '_' + \
                ('with_image' if on_image == 1 else '') + '.png'
        image_output_path = image_path.rsplit('.', 1)[0] + sufix
        visualize_utils.save_image(image_output, image_output_path, proc=visualize_utils.normalize_rgb)

        # respond with image path
        image_path = 'api/static/' + image.relative_path.rsplit('.', 1)[0] + sufix
        return {'image_path': image_path}


# /image/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)
        dataset = Dataset.query.get(image.dataset_id)
        image_db_path = os.path.join(dataset.path, image.relative_path)
        if not os.path.isfile(image_path):
            shutil.copyfile(image_db_path, image_path)
        image_url = 'api/static/' + image.relative_path
        return {'image_path': image_url}


# /images/<int:model_id>
class ImageList(ProtectedResource):
    def get(self, model_id):
        model = Model.query.get(model_id)
        images = model.dataset.images
        return {'images': [image.json() for image in images]}


class Algorithms(ProtectedResource):
    def get(self):
        return {'algorithms': [{'id': a_id, 'name': algo.name()}
                               for a_id, algo
                               in visualize_utils.algorithms_register.items()]}


class Postprocessing(ProtectedResource):
    def get(self):
        return {'postprocessing': [{'id': p_id, 'name': postprocessing.name()}
                                   for p_id, postprocessing
                                   in visualize_utils.postprocessing_register.items()]}
