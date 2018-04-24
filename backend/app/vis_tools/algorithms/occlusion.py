# https://github.com/PAIR-code/saliency

from app.vis_tools.algorithms.saliency import SaliencyMask
import tensorflow as tf
import numpy as np

class Occlusion(SaliencyMask):
    """A SaliencyMask class that computes saliency masks by occluding the image.
    This method slides a window over the image and computes how that occlusion
    affects the class score. When the class score decreases, this is positive
    evidence for the class, otherwise it is negative evidence.
    """

    def __init__(self, graph, session, y, x):
        super(Occlusion, self).__init__(graph, session, y, x)

    def GetMask(self, x_value, feed_dict = {}, size = 50, value = 0):
        """Returns an occlusion mask."""
        occlusion_window = np.array([size, size, x_value.shape[2]])
        occlusion_window.fill(value)

        occlusion_scores = np.zeros_like(x_value)

        feed_dict[self.x] = [x_value]
        original_y_value = self.session.run(self.y, feed_dict=feed_dict)

        for row in range(0, x_value.shape[0] - size, 50):
            print(row)
            for col in range(0, x_value.shape[1] - size, 50):
                x_occluded = np.array(x_value)

                x_occluded[row:row+size, col:col+size, :] = occlusion_window

                feed_dict[self.x] = [x_occluded]
                y_value = self.session.run(self.y, feed_dict=feed_dict)

                score_diff = original_y_value - y_value
                occlusion_scores[row:row+size, col:col+size, :] += score_diff

        print(occlusion_scores)
        print(occlusion_scores.shape)

        return occlusion_scores

    def __str__(self):
        return "occlusion"