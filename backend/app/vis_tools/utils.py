import tensorflow as tf
import json
import numpy as np

from .entropygradient import EntropyGradient
from .guidedbackpropagation import GuidedBackprop

algorithms_register = {
    0: EntropyGradient,
    1: GuidedBackprop
}

class VisualizeSession(object):
    ''' Wraps a tensorflow session and handles graph initialization
    '''

    def __init__(self, graph, weights):
        self.graph = graph
        self.weights = weights

    def __enter__(self):
        self.sess = tf.Session()

        with self.graph.as_default():
            # initialize graph with the given weights
            pass

    def __exit__(self, exc_type, exc_value, traceback):
        self.sess.close()
        return False

    def getMask(self, alg_id, x):
        alg_class = algorithms_register[alg_id]
        alg_instance = alg_class(self.graph, self.sess, "output_tensor_name")

        return alg_instance.getMask(x)

def visualize_saliency(graph, weights, alg_id, image_path):
    saliency_img = None

    input_img = _get_image()

    with VisualizeSession(graph, weights) as vis_session:
        saliency_img = vis_session.getMask(alg_id, input_img)

    # TODO: grayscale image?
    return saliency_img

def _get_image(path):
    # TODO: return image suitable for tensorflow input (???)
    return None

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)
