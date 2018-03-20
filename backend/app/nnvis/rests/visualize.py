import os

from config import DATASET_FOLDER, STATIC_FOLDER

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


class Inference(ProtectedResource):
    def get(self, model_id, image_id):
        dataset_id = 0  # mocked

        image = Image.query.get(image_id, dataset_id)
        image_path, image_label = image.path, image.label
        image_input = visualize_utils.load_image(image_path, proc=True)

        # mocked model query
        model = 0  # = Model.query.get(model_id)
        graph, sess, x, _, _, logits = visualize_utils.load_model(model)

        predictions = visualize_utils.inference(sess, logits, x, image_input)
        return {'class_scores': {class_idx: score for class_idx, score in enumerate(predictions)}}


# visualize/<int:model_id>/<int:alg_id>/<int:image_id>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, image_id):
        if alg_id not in visualize_utils.algorithms_register.keys():
            return {'errormsg': "Bad algorithm id"}, 400

        image = Image.query.get(image_id)
        image_path = os.path.join(STATIC_FOLDER, image.relative_path)

        image_input = visualize_utils.load_image(image_path, proc=visualize_utils.preprocess)

        # mocked model query
        model = 0  # = Model.query.get(model_id)
        graph, sess, x, y, neuron_selector, _ = visualize_utils.load_model(model)

        alg_class = visualize_utils.algorithms_register[alg_id]

        vis_algorithm = alg_class(graph, sess, y, x)
        image_output = vis_algorithm.GetMask(image_input, feed_dict={neuron_selector: image.label})

        image_output_path = image_path.rsplit('.', 1)[0] + str(vis_algorithm) + '.png'
        visualize_utils.save_image(image_output, image_output_path, proc=visualize_utils.normalize_gray)
        image_path = 'api/static/' + image.relative_path.rsplit('.', 1)[0] + str(vis_algorithm) + '.png'
        return {'image_path': image_path}


# /image/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        print(os.curdir)
        image = Image.query.get(image_id)
        image_path = os.path.join(STATIC_FOLDER, image.relative_path)
        image_db_path = os.path.join(DATASET_FOLDER, 'cifar10_small_30', image.relative_path)
        if not os.path.isfile(image_path):
            shutil.copyfile(image_db_path, image_path)
        image_path = 'api/static/' + image.relative_path
        return {'image_path': image_path}

# /images/<int:dataset_id>
class ImageList(ProtectedResource):
    def get(self, dataset_id):
        dataset = Dataset.query.get(dataset_id)
        images = dataset.images
        return {'images': [image.json() for image in images]}


class Algorithms(ProtectedResource):
    def get(self):
        return {alg_class.__name__: alg_id for alg_id, alg_class in algorithms_register}
