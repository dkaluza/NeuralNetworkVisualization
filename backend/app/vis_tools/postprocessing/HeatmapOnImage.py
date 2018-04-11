import numpy as np
import cv2


def normalize_rgb(img):
    if img.dtype == np.uint8 or img.dtype == np.uint32:
        return img
    img -= img.min()
    img /= img.max()
    img *= 255
    img = img.astype(np.uint8)
    return img


class HeatmapOnImage:
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
        print(original_image.dtype)
        heatmap = np.uint8(heatmap * 255)  # Scale between 0-255 to visualize

        activation_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        print(original_image.dtype)
        print(original_image)
        original_image = normalize_rgb(original_image)
        original_image = np.uint8(original_image)
        print(original_image.dtype)
        print(original_image)
        heatmapOnImage = cv2.addWeighted(activation_heatmap, 0.5, original_image, 0.5, 0)

        return heatmapOnImage