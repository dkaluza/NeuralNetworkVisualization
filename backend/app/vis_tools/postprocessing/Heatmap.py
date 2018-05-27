import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class Heatmap(Postprocessing):
    def __init__(self):
        super().__init__()

    @staticmethod
    def process(saliency, original_image_paths=None):
        if original_image_paths is not None:
            assert len(saliency) == len(original_image_paths)

        results = []
        for i, saliency in enumerate(saliency):
            original_image_path = original_image_paths[i]
            if original_image_path is not None:
                original_image = cv2.imread(original_image_path)
                height, width = saliency.shape[1], saliency.shape[0]
                original_image = cv2.resize(original_image, (height, width))
                saliency = cv2.addWeighted(saliency, 0.5, original_image, 0.5, 0)

            results.append(saliency)

        return results


    @staticmethod
    def name():
        return "heatmap"