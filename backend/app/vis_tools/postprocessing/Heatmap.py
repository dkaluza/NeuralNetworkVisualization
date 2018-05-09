import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class Heatmap(Postprocessing):
    def __init__(self):
        super().__init__()

    @staticmethod
    def process(saliency, original_image_path=None):
        if original_image_path is not None:
            original_image = cv2.imread(original_image_path)
            height, width = saliency.shape[1], saliency.shape[0]
            original_image = cv2.resize(original_image, (height, width))
            print(saliency.shape)
            print(original_image.shape)
            saliency = cv2.addWeighted(saliency, 0.5, original_image, 0.5, 0)

        return saliency


    @staticmethod
    def name():
        return "heatmap"