import os

from flask import current_app as app

from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Image
from app.nnvis.models import Model
from app.nnvis.models import Dataset

# from app.vis_tools.utils import algorithms_register
# from app.vis_tools.utils import visualize_saliency
# from app.vis_tools.utils import inference
# from app.vis_tools.utils import NumpyEncoder

from app.vis_tools import visualize_utils

import json
import shutil


# inference/<int:model_id>/<int:image_id>
class Inference(ProtectedResource):
    def get(self, model_id, image_id):
        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)

        image_input = visualize_utils.load_image(image_path, proc=visualize_utils.preprocess)

        model = Model.query.get(model_id)
        graph, sess, x, _, _, logits = visualize_utils.load_model(model)
        predictions = visualize_utils.inference(sess, logits, x, image_input)
        sess.close()

        dataset = Dataset.query.get(model.dataset_id)
        class_names = dataset.labels[1:-1].split(',')
        scores = [{'class_number': class_number,
                   'class_name': class_names[class_number],
                   'score': score}
                  for class_number, score in enumerate(predictions)]
        return {'class_scores': scores}


# visualize/<int:model_id>/<int:alg_id>/<int:image_id>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, image_id):
        if alg_id not in visualize_utils.algorithms_register:
            return {'errormsg': "Bad algorithm id"}, 400

        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)

        image_input = visualize_utils.load_image(image_path, proc=visualize_utils.preprocess)

        model = Model.query.get(model_id)
        graph, sess, x, y, neuron_selector, _ = visualize_utils.load_model(model)

        alg_class = visualize_utils.algorithms_register[alg_id]

        vis_algorithm = alg_class(graph, sess, y, x)
        image_output = vis_algorithm.GetMask(image_input, feed_dict={neuron_selector: image.label})

        sess.close()

        image_output_path = image_path.rsplit('.', 1)[0] + str(vis_algorithm) + '.png'
        visualize_utils.save_image(image_output, image_output_path, proc=visualize_utils.normalize_gray_pos)
        image_path = 'api/static/' + image.relative_path.rsplit('.', 1)[0] + str(vis_algorithm) + '.png'
        return {'image_path': image_path}


# /image/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        image = Image.query.get(image_id)
        image_path = os.path.join(app.config['STATIC_FOLDER'], image.relative_path)
        image_db_path = os.path.join(app.config['DATASET_FOLDER'], 'cifar10_small_30', image.relative_path)
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
        return {alg_class.__name__: alg_id for alg_id, alg_class in algorithms_register}
