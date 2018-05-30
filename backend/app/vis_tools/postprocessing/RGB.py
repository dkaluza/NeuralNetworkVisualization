import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class RGB(Postprocessing):
    def __init__(self):
        super().__init__()

    @staticmethod
    def process(saliency, original_image_paths=None):


        results = []
        for i, image in enumerate(saliency):
            original_image_path = original_image_paths[i]
            if original_image_path is not None:
                image = np.sum(np.abs(image), axis=2)
                im_max = np.percentile(image, 99)  # could be variable
                im_min = np.min(image)
                image = np.clip((image - im_min) / (im_max - im_min), 0, 1)
                image = np.uint8(image * 255)

                original_image = cv2.imread(original_image_path)
                height, width = saliency[i].shape[1], saliency[i].shape[0]
                original_image = cv2.resize(original_image, (height, width))
                image_new = np.zeros(original_image.shape, dtype=np.uint8)
                image_new[..., 2] = image
                image = cv2.addWeighted(image_new, 0.5, original_image, 0.5, 0)

            results.append(image)

        return results


    @staticmethod
    def name():
        return "color"
