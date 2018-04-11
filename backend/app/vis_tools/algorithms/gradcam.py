# https://github.com/PAIR-code/saliency

from app.vis_tools.algorithms.vanillasaliency import SaliencyMask
import tensorflow as tf
import numpy as np


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
        self.gradients_node = tf.gradients(y, conv_layer)[0]

    def GetMask(self, x_value, feed_dict={}, should_resize=True, three_dims=True):
        """
        Returns a Grad-CAM mask.

        Modified from https://github.com/Ankush96/grad-cam.tensorflow/blob/master/main.py#L29-L62
        Args:
          x_value: Input value, not batched.
          feed_dict: (Optional) feed dictionary to pass to the session.run call.
          should_resize: boolean that determines whether a low-res Grad-CAM mask should be
              upsampled to match the size of the input image
          three_dims: boolean that determines whether the grayscale mask should be converted
              into a 3D mask by copying the 2D mask value's into each color channel

        """
        feed_dict[self.x] = [x_value]
        (output, grad) = self.session.run([self.conv_layer, self.gradients_node],
                                          feed_dict=feed_dict)
        output = output[0]
        grad = grad[0]

        weights = np.mean(grad, axis=(0, 1))
        grad_cam = np.ones(output.shape[0:2], dtype=np.float32)

        # weighted average
        for i, w in enumerate(weights):
            grad_cam += w * output[:, :, i]

        # pass through relu
        grad_cam = np.maximum(grad_cam, 0)

        # resize heatmap to be the same size as the input
        if should_resize:
            grad_cam = grad_cam / np.max(grad_cam)  # values need to be [0,1] to be resized
            with self.graph.as_default():
                grad_cam = np.squeeze(tf.image.resize_bilinear(
                    np.expand_dims(np.expand_dims(grad_cam, 0), 3),
                    x_value.shape[:2]).eval(session=self.session))

        # convert grayscale to 3-D
        if three_dims:
            grad_cam = np.expand_dims(grad_cam, axis=2)
            grad_cam = np.tile(grad_cam, [1, 1, 3])


        return grad_cam