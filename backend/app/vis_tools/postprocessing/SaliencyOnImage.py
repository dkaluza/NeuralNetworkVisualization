import numpy as np
import cv2

class SaliencyOnImage:
    def __init__(self):
        pass

    def process(self, original_image, saliency):
        grayscale_im = np.sum(np.abs(saliency), axis=2)
        im_max = np.percentile(grayscale_im, 99) # could be variable
        im_min = np.min(grayscale_im)
        grayscale_im = np.clip((grayscale_im - im_min) / (im_max - im_min), 0, 1)

        shape = (*grayscale_im.shape, 3)
        heat_image = np.zeros(shape)
        heat_image[..., 0] = grayscale_im


        saliencyOnImage = cv2.addWeighted(heat_image, 0.7, original_image, 0.3, 0)

        return saliencyOnImage