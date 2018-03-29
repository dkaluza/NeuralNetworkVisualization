import tensorflow as tf

from app.utils import NnvisException


def _calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def _calculate_mean_squared_error(y, pred):
    return tf.losses.mean_squared_error(y, pred)


def _calculate_cross_entropy(y, pred):
    return tf.reduce_mean(-tf.reduce_sum(y * tf.log(pred), axis=1))


def calculate_loss(loss, y, pred):
    losses = {
        'logloss': _calculate_logloss,
        'mse': _calculate_mean_squared_error,
        'cross_entropy': _calculate_cross_entropy
    }

    loss_op = losses.get(loss)
    if loss_op is None:
        raise NnvisException('Unknow loss: {}'.format(loss))

    return loss_op(y, pred)
