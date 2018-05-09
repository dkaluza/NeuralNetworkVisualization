import tensorflow as tf
import numpy as np
import cv2
import os

from app.vis_tools.algorithms.saliency import Saliency
from app.vis_tools.algorithms.guidedbackprop import GuidedBackprop
from app.vis_tools.algorithms.occlusion import Occlusion
from app.vis_tools.algorithms.gradcam import GradCAM


from app.vis_tools.postprocessing.Grayscale import Grayscale
from app.vis_tools.postprocessing.RGB import RGB
from app.vis_tools.postprocessing.Heatmap import Heatmap

from io import BytesIO

algorithms_register = {
    0: Saliency,
    1: GuidedBackprop,
    2: GradCAM,
    # 3: GuidedGradCAM,
}

postprocessing_register = {
    0: Grayscale,
    1: RGB,
    2: Heatmap,
}


def preprocess(img):
    img = img / 127.5
    img = img - 1.0
    return img


def normalize_rgb(img):
    if img.dtype == np.uint8 or img.dtype == np.uint32:
        return img
    img -= img.min()
    img /= img.max()
    img *= 255
    img = img.astype(np.uint8)
    return img


def rgb2gray(img):
    return np.dot(img[..., :3], [0.299, 0.587, 0.144])


def normalize_gray(img):
    img -= img.min()
    if img.shape[-1] == 3:
        img = rgb2gray(img)
    img = rgb2gray(img)
    img /= img.max()
    img *= 255
    img = img.astype(np.uint8)
    return img


def normalize_gray_pos(img):
    if img.shape[-1] == 3:
        img = rgb2gray(img)
    img[img < 0] = 0
    img /= img.max()
    img *= 255
    img.clip(0.0, 255.0)
    img = img.astype(np.uint8)
    return img


def load_image(image_path, dst_shape, proc=None):
    if len(dst_shape) == 2 or (len(dst_shape) == 3 and dst_shape[-1] == 1):
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        height, width = dst_shape[1], dst_shape[0]
        image = cv2.resize(image, (height, width))
        image = np.expand_dims(image, axis=2)
    else:
        image = cv2.imread(image_path)

    if proc:
        image = proc(image)

    image = np.expand_dims(image, axis=0)
    return image


def save_image(image, proc=None):
    if proc:
        image = proc(image)
    return BytesIO(cv2.imencode('.png', image)[1].tostring())


def load_model(meta_file, weight_path, number_of_inputs):
    graph = tf.Graph()
    with graph.as_default():
        saver = tf.train.import_meta_graph(meta_file)
        sess = tf.Session(graph=graph)
        saver.restore(sess, weight_path)

        xs = []
        for i in range(number_of_inputs):
            tensor_name = 'input/{}:0'.format(i + 1)
            xs.append(graph.get_tensor_by_name(tensor_name))

        logits = graph.get_tensor_by_name('logits:0')
        neuron_selector = tf.placeholder(tf.int32)
        y = logits[0][neuron_selector]
    return graph, sess, xs, y, neuron_selector, logits
