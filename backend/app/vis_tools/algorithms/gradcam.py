# https://github.com/PAIR-code/saliency

from app.vis_tools.algorithms.saliency import SaliencyMask
from app.vis_tools.postprocessing.Heatmap import Heatmap

import tensorflow as tf
import numpy as np
import scipy.misc
import cv2


class GradCAM(SaliencyMask):
    postprocessings = {
        0: Heatmap,
    }

    def __init__(self, graph, session, y, x, last_conv_tensor_name):
        super(GradCAM, self).__init__(graph, session, y, x)
        # last_conv = 'InceptionV3/InceptionV3/Mixed_7c/concat:0' # mocked
        self.conv_layer = graph.get_tensor_by_name(last_conv_tensor_name)
        self.gradients_node = tf.gradients(y, self.conv_layer)[0]

    def GetMask(self, x_value, feed_dict={}, should_resize=True, three_dims=True):
        feed_dict[self.x] = x_value
        (output, grad) = self.session.run([self.conv_layer, self.gradients_node],
                                          feed_dict=feed_dict)

        output = output[0]
        grad = grad[0]

        weights = np.mean(grad, axis=(0, 1))
        grad_cam = np.ones(output.shape[:2], dtype=np.float32)

        for i, w in enumerate(weights):
            grad_cam += w * output[:, :, i]

        # pass through relu (?) its done already i guess
        grad_cam = np.maximum(grad_cam, 0)
        grad_cam -= grad_cam.min()
        grad_cam /= grad_cam.max()

        grad_cam = scipy.misc.imresize(grad_cam, x_value.shape[1:3])  # [0.0, 1.0] -> [0, 255]
        grad_cam = cv2.applyColorMap(grad_cam, cv2.COLORMAP_JET)

        print(grad_cam.shape)

        return grad_cam

    @staticmethod
    def name():
        return "grad-CAM"