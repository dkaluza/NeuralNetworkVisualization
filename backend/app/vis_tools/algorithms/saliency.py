# https://github.com/PAIR-code/saliency

import numpy as np
import tensorflow as tf

from app.vis_tools.postprocessing.Grayscale import Grayscale
from app.vis_tools.postprocessing.RGB import RGB


class SaliencyMask(object):
    def __init__(self, graph, session, y, xs):
        size = 1
        for shape in y.shape:
            size *= shape
        assert size == 1

        self.graph = graph
        self.session = session
        self.y = y
        self.xs = xs

    def GetMask(self, x_value, feed_dict={}):
        raise NotImplementedError('A derived class should implemented GetMask()')


class Saliency(SaliencyMask):
    r"""A SaliencyMask class that computes saliency masks with a gradient."""
    postprocessings = {
        0: Grayscale,
        1: RGB,
    }

    def __init__(self, graph, session, y, xs):
        super().__init__(graph, session, y, xs)
        self.gradients_nodes = [tf.gradients(y, x)[0] for x in xs]

    def GetMask(self, x_values, feed_dict={}):
        for i, x_value in enumerate(x_values):
            feed_dict[self.xs[i]] = x_value


        results = self.session.run(
            self.gradients_nodes,
            feed_dict=feed_dict
        )

        return [result[0] for result in results]

    @staticmethod
    def name():
        return 'saliency'
