import tensorflow as tf
import numpy as np
import cv2

from .entropygradient import GradientSaliency
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


def normalize_gray(img):
    img -= img.min()
    img = np.dot(img[..., :3], [0.299, 0.587, 0.144])
    img /= img.max()
    img *= 255
    img = img.astype(np.uint8)
    return img


def load_image(image_path, proc=None):
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
    graph = tf.Graph()
    with graph.as_default():
        # mocked model
        saver = tf.train.import_meta_graph('mockup/models/mock_cnn_cifar10.ckpt.meta')
        sess = tf.Session(graph=graph)
        saver.restore(sess, tf.train.latest_checkpoint('mockup/models/'))

        # important !!! - logits tensor and image placeholder need to be named with agreed convention
        logits = graph.get_tensor_by_name('mock_cnn/fc5/logits:0')
        x = graph.get_tensor_by_name('x:0')

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
    return predictions
