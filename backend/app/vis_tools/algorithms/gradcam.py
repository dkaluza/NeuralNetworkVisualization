# https://github.com/PAIR-code/saliency

import cv2
import numpy as np
import scipy.misc
import tensorflow as tf

from app.vis_tools.algorithms.saliency import SaliencyMask
from app.vis_tools.postprocessing.Heatmap import Heatmap


class GradCAM(SaliencyMask):
    postprocessings = {
        0: Heatmap,
    }

    def __init__(self, graph, session, y, xs, last_conv_tensor_names):
        super().__init__(graph, session, y, xs)
        # last_conv = 'InceptionV3/InceptionV3/Mixed_7c/concat:0' # mocked
        self.conv_layers = [graph.get_tensor_by_name(conv_layer) for conv_layer in last_conv_tensor_names]
        self.gradients_nodes = [tf.gradients(y, conv_layer)[0] for conv_layer in self.conv_layers]

    def GetMask(self, x_values, feed_dict={}, should_resize=True, three_dims=True):
        for i, x_value in enumerate(x_values):
            feed_dict[self.xs[i]] = x_value

        (outputs, grads) = self.session.run(
            [self.conv_layers, self.gradients_nodes],
            feed_dict=feed_dict
        )

        results = []
        for output, grad in zip(outputs, grads):
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

            # bilinear resize
            grad_cam = scipy.misc.imresize(grad_cam, x_value.shape[1:3])  # [0.0, 1.0] -> [0, 255]
            grad_cam = cv2.applyColorMap(grad_cam, cv2.COLORMAP_JET)
            results.append(grad_cam)

        return results

    @staticmethod
    def name():
        return "grad-CAM"
