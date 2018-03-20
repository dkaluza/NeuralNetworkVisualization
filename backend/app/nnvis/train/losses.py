import tensorflow as tf

from app.utils import NnvisException


def _calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def _calculate_mean_squared_error(y, pred):
    return tf.losses.mean_squared_error(y, pred)


def calculate_loss(loss, y, pred):
    if loss == 'logloss':
        return _calculate_logloss(y, pred)
    elif loss == 'mse':
        return _calculate_mean_squared_error(y, pred)
    else:
        raise NnvisException('Unknow loss: {}'.format(loss))
