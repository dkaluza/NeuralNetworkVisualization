import numpy as np
import cv2

from app.vis_tools.postprocessing.Postprocessing import Postprocessing


class Heatmap(Postprocessing):
    def __init__(self):
        super().__init__()

    @staticmethod
    def process(saliency, original_image=None):
        if original_image is not None:
            saliency = cv2.addWeighted(saliency, 0.5, original_image, 0.5, 0)

        return saliency


    @staticmethod
    def name():
        return "heatmap"