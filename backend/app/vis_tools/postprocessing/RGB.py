import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class RGB(Postprocessing):
    def __init__(self):
        super().__init__()

    def process(self, saliency, original_image=None):
        if original_image is not None:
            image = np.sum(np.abs(saliency), axis=2)
            im_max = np.percentile(image, 99)  # could be variable
            im_min = np.min(image)
            image = np.clip((image - im_min) / (im_max - im_min), 0, 1)
            image = np.uint8(image * 255)

            shape = (*image.shape, 3)
            image_new = np.zeros(shape, dtype=np.uint8)
            image_new[..., 0] = image
            saliency = cv2.addWeighted(image_new, 0.5, original_image, 0.5, 0)

        return saliency


    @staticmethod
    def name():
        return "color"
