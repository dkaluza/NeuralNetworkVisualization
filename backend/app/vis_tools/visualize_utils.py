import tensorflow as tf
import numpy as np
import cv2
import os

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
    img = rgb2gray(img)
    img /= img.max()
    img *= 255
    img = img.astype(np.uint8)
    return img


def normalize_gray_pos(img):
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


def save_image(image, image_path, proc=None):
    if proc:
        image = proc(image)
    cv2.imwrite(image_path, image)


# mocked for now
def load_model(model):
    model_folder = model.weights_path
    model_files = os.listdir(model_folder)
    meta_file = list(filter(lambda x: '.meta' in x, model_files))
    if len(meta_file) != 1:
        raise Exception("Something wrong with either weight_path={} or folder contents".format(model_folder))
    meta_file = os.path.join(model_folder, meta_file[0])

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

        # Construct tensor for predictions.
        # prediction = tf.argmax(logits, 1)

    return graph, sess, x, y, neuron_selector, logits


def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()


def inference(sess, logits, x, image_input):
    logits_score = logits.eval(feed_dict={x: [image_input]}, session=sess)
    predictions = softmax(logits_score[0])
    return [prediction.item() for prediction in predictions]
