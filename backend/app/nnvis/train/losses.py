import tensorflow as tf

from app.utils import NnvisException


def _loss(name, id):
    return {'name': name, 'id': id}


LOSSES_LIST = [
        _loss('Logloss', 'logloss'),
        _loss('Mean squared error', 'mse'),
        _loss('Absolute difference', 'abs_diff'),
        _loss('Hinge loss', 'hinge'),
        _loss('Cross entropy', 'cross_entropy')
    ]


def get_loss(id):
    return list(filter(
        lambda loss: loss['id'] == id,
        LOSSES_LIST))[0]


def _calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def _calculate_mean_squared_error(y, pred):
    return tf.losses.mean_squared_error(y, pred)


def _calculate_cross_entropy(y, pred):
    # clipping for numerical stability
    _EPS = 1e-12
    pred = tf.clip_by_value(pred, _EPS, 1 - _EPS)
    return tf.reduce_mean(-tf.reduce_sum(y * tf.log(pred), axis=1))


def _calculate_absolute_difference(y, pred):
    return tf.losses.absolute_difference(y, pred)


def _calculate_hinge_loss(y, pred):
    return tf.losses.hinge_loss(y, pred)


def calculate_loss(loss, y, pred):
    losses = {
        'logloss': _calculate_logloss,
        'mse': _calculate_mean_squared_error,
        'cross_entropy': _calculate_cross_entropy,
        'abs_diff': _calculate_absolute_difference,
        'hinge': _calculate_hinge_loss
    }

    loss = losses.get(loss)
    if loss is None:
        raise NnvisException('Unknow loss: {}'.format(loss))

    return loss(y, pred)
