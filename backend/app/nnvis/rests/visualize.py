import os
import json
import shutil
import base64
from io import BytesIO

from flask import current_app as app
from flask import send_file

from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Image
from app.nnvis.models import Model
from app.nnvis.models import Dataset

# from app.vis_tools.utils import algorithms_register
# from app.vis_tools.utils import visualize_saliency
# from app.vis_tools.utils import inference
# from app.vis_tools.utils import NumpyEncoder

from app.vis_tools import visualize_utils


def safe_add_is_training(feed_dict, graph, train):
    try:
        is_training = graph.get_tensor_by_name('is_training:0')
        feed_dict[is_training] = train
    except KeyError:
        pass


# inference/<int:model_id>/<int:image_id>
class Inference(ProtectedResource):
    def get(self, model_id, image_id):
        image = Image.query.get(image_id)
        ds = Dataset.query.get(image.dataset_id)
        image_path = os.path.join(ds.path, image.relative_path)

        model = Model.query.get(model_id)
        graph, sess, x, *_ = visualize_utils.load_model(model)


        output_op = graph.get_tensor_by_name('output:0')

        image_input = visualize_utils.load_image(image_path, x.shape.as_list()[1:], proc=visualize_utils.preprocess)

        feed_dict = {
                x: [image_input]
                }
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


# visualize/<int:model_id>/<int:alg_id>/<int:image_id>
class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, image_id):
        if alg_id not in visualize_utils.algorithms_register:
            return {'errormsg': "Bad algorithm id"}, 400

        image = Image.query.get(image_id)
        ds = Dataset.query.get(image.dataset_id)
        image_path = os.path.join(ds.path, image.relative_path)

        model = Model.query.get(model_id)
        graph, sess, x, y, neuron_selector, _ = visualize_utils.load_model(model)

        alg_class = visualize_utils.algorithms_register[alg_id]
        vis_algorithm = alg_class(graph, sess, y, x)

        feed_dict = {
                neuron_selector: int(image.label)
                }
        safe_add_is_training(feed_dict, graph, False)

        image_input = visualize_utils.load_image(image_path, x.shape.as_list()[1:], proc=visualize_utils.preprocess)
        saliency = vis_algorithm.GetMask(image_input, feed_dict=feed_dict)

        sess.close()

        img_stream = visualize_utils.save_image(saliency, proc=visualize_utils.normalize_gray_pos)
        img_b64 = base64.b64encode(img_stream.getvalue()).decode()
        return {'img': img_b64}


# /image/<string:image_id>
class Images(ProtectedResource):
    def get(self, image_id):
        image = Image.query.get(image_id)
        dataset = Dataset.query.get(image.dataset_id)
        img_path = os.path.join(dataset.path, image.relative_path)
        with open(img_path, 'rb') as img_f:
            img_b64 = base64.b64encode(img_f.read()).decode()
        return {'img': img_b64}


# /images/<int:model_id>
class ImageList(ProtectedResource):
    def get(self, model_id):
        model = Model.query.get(model_id)
        images = model.dataset.images
        return {'images': [image.json() for image in images]}


class Algorithms(ProtectedResource):
    def get(self):
        return {
            'algs': {alg_class.__name__: alg_id for alg_id, alg_class in visualize_utils.algorithms_register.items()}
        }
