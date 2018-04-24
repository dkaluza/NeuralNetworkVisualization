import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class Grayscale(Postprocessing):
    def __init__(self):
        super().__init__()

    @staticmethod
    def process(saliency, original_image=None):
        image = np.sum(np.abs(saliency), axis=2)
        im_max = np.percentile(image, 99) # could be variable
        im_min = np.min(image)
        image = np.clip((image - im_min) / (im_max - im_min), 0, 1)
        image = np.uint8(image * 255)

        if original_image is not None:
            shape = (*image.shape, 3)
            image_new = np.zeros(shape, dtype=np.uint8)
            image_new[..., 0] = image
            image = cv2.addWeighted(image_new, 0.5, original_image, 0.5, 0)

        return image

    @staticmethod
    def name():
        return "grayscale"