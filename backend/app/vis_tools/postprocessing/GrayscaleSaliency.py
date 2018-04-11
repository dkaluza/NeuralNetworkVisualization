import numpy as np

class GrayscaleSaliency:
    def __init__(self):
        pass

    def process(self, original_image, saliency):
        print('in GrayScaleSaliency.process()')
        print(saliency.shape)
        grayscale_im = np.sum(np.abs(saliency), axis=2)
        im_max = np.percentile(grayscale_im, 99) # could be variable
        im_min = np.min(grayscale_im)
        grayscale_im = np.clip((grayscale_im - im_min) / (im_max - im_min), 0, 1)
        grayscale_im = np.expand_dims(grayscale_im, axis=2)
        return grayscale_im