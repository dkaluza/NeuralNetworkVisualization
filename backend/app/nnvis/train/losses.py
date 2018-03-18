import tensorflow as tf


def calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def calculate_mean_squared_error(y, pred):
    return tf.losses.mean_squared_error(y, pred)


def calculate_loss(loss, y, pred):
    if loss == 'logloss':
        return calculate_logloss(y, pred)
    elif loss == 'mse':
        return calculate_mean_squared_error(y, pred)
    else:
        raise Exception('Unknow loss: {}'.format(loss))
