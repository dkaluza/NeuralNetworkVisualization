from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Image
from app.nnvis.models import Model

from app.vis_tools.utils import algorithms_register
from app.vis_tools.utils import visualize_saliency
from app.vis_tools.utils import inference
from app.vis_tools.utils import NumpyEncoder

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
        dataset_id = 0  # mocked

        image = Image.query.get(image_id, dataset_id)
        image_path, image_label = image.path, image.label
        image_input = visualize_utils.load_image(image_path, proc=True)

        # mocked model query
        model = 0  # = Model.query.get(model_id)
        graph, sess, x, y, neuron_selector, _ = visualize_utils.load_model(model)

        alg_class = visualize_utils.mocked_alg_hooks[alg_id]

        vis_algorithm = alg_class(graph, sess, x, y)
        image_output = vis_algorithm.GetMask(image_input, feed_dict={neuron_selector: image_label})

        image_output_path = image_path.rsplit('.', 1)[0] + str(vis_algorithm) + '.png'
        visualize_utils.save_image(image_output, image_output_path)

        return {'image_path': image_output_path}


# /visualize/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        dataset_id = 0
        image = Image.query.get(image_id, dataset_id)
        image_path_statis = 'api/static/images/' + image.name
        shutil.copyfile(image.relative_path, image_path_statis)
        return {'image_path': image_path_statis}


class ImageList(ProtectedResource):
    def get(self, dataset_id):
        images = Image.query.get(dataset_id)
        return {'items': [image.json() for image in Image.query.filter(dataset_id=dataset_id)]}


class Algorithms(ProtectedResource):
    def get(self):
        return {alg_class.__name__: alg_id for alg_id, alg_class in algorithms_register}
