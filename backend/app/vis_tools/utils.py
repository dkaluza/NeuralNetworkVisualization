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
        self.active = False

    def __enter__(self):
        self.active = True
        self.sess = tf.Session()

        with self.graph.as_default():
            # TODO: initialize graph with the given weights
            pass

    def __exit__(self, exc_type, exc_value, traceback):
        self.sess.close()
        self.active = False
        return False

    def getMask(self, alg_id, x):
        self.__abort_inactive('getMask')
        y_node = None # TODO: get output tensor from graph
        alg_class = algorithms_register[alg_id]
        alg_instance = alg_class(self.graph, self.sess, y_node)

        return alg_instance.getMask(x)

    def inference(self, x):
        self.__abort_inactive('inference')
        y_node = None # TODO: get output tensor from graph
        x_node = None # TODO: get input tensor from graph

        return self.sess.run(y_node, feed_dict={x_node: x})

    def __abort_inactive(self, func_name):
        if not self.active:
            raise Exception("{}() called on an inactive VisualizeSession".format(func_name))

def visualize_saliency(graph, weights, alg_id, image_path):
    saliency_img = None
    input_img = _get_image(image_path)

    with VisualizeSession(graph, weights) as vis_session:
        saliency_img = vis_session.getMask(alg_id, input_img)

    # TODO: grayscale image?
    return saliency_img

def inference(graph, weights, image_path):
    prediction = None
    input_img = _get_image(image_path)

    with VisualizeSession(graph, weights) as vis_session:
        prediction = vis_session.inference(input_img)

    return prediction

def _get_image(path):
    # TODO: return image suitable for tensorflow input (???)
    return None

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)
