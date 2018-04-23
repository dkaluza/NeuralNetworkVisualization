import tensorflow as tf
import numpy as np
import cv2
import os

from io import BytesIO

from .vanillasaliency import GradientSaliency
from .guidedbackpropagation import GuidedBackprop

algorithms_register = {
    0: GradientSaliency,
    1: GuidedBackprop
}


def preprocess(img):
    img = img / 255.0
    return img


def normalize_rgb(img):
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
        image = np.reshape(image, dst_shape)
    else:
        image = cv2.imread(image_path)

    if proc:
        image = proc(image)
    return image


def save_image(image, proc=None):
    if proc:
        image = proc(image)
    return BytesIO(cv2.imencode('.png', image)[1].tostring())


# mocked for now
def load_model(meta_file, model_folder):
    graph = tf.Graph()
    with graph.as_default():
        # mocked model
        saver = tf.train.import_meta_graph(meta_file)
        sess = tf.Session(graph=graph)
        saver.restore(sess, tf.train.latest_checkpoint(model_folder))

        logits = graph.get_tensor_by_name('logits:0')
        x = graph.get_tensor_by_name('input/1:0')

        neuron_selector = tf.placeholder(tf.int32)
        y = logits[0][neuron_selector]

    return graph, sess, x, y, neuron_selector, logits
