# https://github.com/PAIR-code/saliency

from app.vis_tools.algorithms.saliency import SaliencyMask
import tensorflow as tf
import numpy as np
import scipy.misc
import cv2


class GradCAM(SaliencyMask):
    """A SaliencyMask class that computes saliency masks with Grad-CAM.

    https://arxiv.org/abs/1610.02391
    Example usage (based on Examples.ipynb):
    grad_cam = GradCam(graph, sess, y, images, conv_layer = end_points['Mixed_7c'])
    grad_mask_2d = grad_cam.GetMask(im, feed_dict = {neuron_selector: prediction_class},
                                    should_resize = False,
                                    three_dims = False)
    The Grad-CAM paper suggests using the last convolutional layer, which would
    be 'Mixed_5c' in inception_v2 and 'Mixed_7c' in inception_v3.
    """

    def __init__(self, graph, session, y, x):
        super(GradCAM, self).__init__(graph, session, y, x)
        conv_layer = 'InceptionV3/InceptionV3/Mixed_7c/concat:0' # mocked
        self.conv_layer = graph.get_tensor_by_name(conv_layer)
        self.gradients_node = tf.gradients(y, self.conv_layer)[0]

    def GetMask(self, x_value, feed_dict={}, should_resize=True, three_dims=True):
        feed_dict[self.x] = [x_value]
        (output, grad) = self.session.run([self.conv_layer, self.gradients_node],
                                          feed_dict=feed_dict)

        output = output[0]
        grad = grad[0]

        weights = np.mean(grad, axis=(0, 1))
        grad_cam = np.ones(output.shape[0:2], dtype=np.float32)

        for i, w in enumerate(weights):
            grad_cam += w * output[:, :, i]

        # pass through relu (?) its done already i guess
        grad_cam = np.maximum(grad_cam, 0)
        grad_cam -= grad_cam.min()
        grad_cam /= grad_cam.max()

        grad_cam = scipy.misc.imresize(grad_cam, x_value.shape[:2])  # [0.0, 1.0] -> [0, 255]
        grad_cam = cv2.applyColorMap(grad_cam, cv2.COLORMAP_JET)

        return grad_cam

    @staticmethod
    def name():
        return "grad-CAM"