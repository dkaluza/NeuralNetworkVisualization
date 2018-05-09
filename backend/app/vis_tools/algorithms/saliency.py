# https://github.com/PAIR-code/saliency

import numpy as np
import tensorflow as tf

from app.vis_tools.postprocessing.Grayscale import Grayscale
from app.vis_tools.postprocessing.RGB import RGB


class SaliencyMask(object):
    def __init__(self, graph, session, y, x):
        size = 1
        for shape in y.shape:
            size *= shape
        assert size == 1

        self.graph = graph
        self.session = session
        self.y = y
        self.x = x

    def GetMask(self, x_value, feed_dict={}):
        raise NotImplementedError('A derived class should implemented GetMask()')


class Saliency(SaliencyMask):
    r"""A SaliencyMask class that computes saliency masks with a gradient."""
    postprocessings = {
        0: Grayscale,
        1: RGB,
    }

    def __init__(self, graph, session, y, x):
        super().__init__(graph, session, y, x)
        self.gradients_node = tf.gradients(y, x)[0]

    def GetMask(self, x_value, feed_dict={}):
        print(x_value.shape)
        feed_dict[self.x] = x_value
        return self.session.run(self.gradients_node, feed_dict=feed_dict)[0]

    @staticmethod
    def name():
        return 'saliency'
