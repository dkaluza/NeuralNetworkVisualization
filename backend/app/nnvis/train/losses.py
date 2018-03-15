import tensorflow as tf

def calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def calculate_loss(loss, y, pred):
    if loss == 'logloss':
        return calculate_logloss(y. pred)
    else:
        raise Exception('Unknow loss: {}'.format(loss))
