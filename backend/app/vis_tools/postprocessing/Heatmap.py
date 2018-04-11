import numpy as np
import cv2

class Heatmap:
    def __init__(self):
        pass

    def process(self, original_image, saliency):
        grayscale_im = np.sum(np.abs(saliency), axis=2)
        im_max = np.percentile(grayscale_im, 99) # could be variable
        im_min = np.min(grayscale_im)
        grayscale_im = np.clip((grayscale_im - im_min) / (im_max - im_min), 0, 1)

        # shape = (*grayscale_im.shape, 3)
        # heat_image = np.zeros(shape)
        # heat_image[..., 0] = grayscale_im

        heatmap = np.maximum(grayscale_im, 0)
        heatmap = (heatmap - np.min(heatmap)) / (np.max(heatmap) - np.min(heatmap))  # Normalize between 0-1

        heatmap = np.uint8(heatmap * 255)  # Scale between 0-255 to visualize

        activation_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        print(activation_heatmap.shape)
        # activation_heatmap = np.expand_dims(activation_heatmap, axis=2)
        # saliencyOnImage = cv2.addWeighted(heat_image, 0.7, original_image, 0.3, 0)
        print(activation_heatmap.shape)
        cv2.imwrite('fdf.png', activation_heatmap)
        return activation_heatmap