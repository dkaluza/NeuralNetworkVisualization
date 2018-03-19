import tensorflow as tf

from app.utils import NnvisException


def _adam(lr, beta1, beta2, epsilon):
    return tf.train.AdamOptimizer(learning_rate=lr,
                                  beta1=beta1,
                                  beta2=beta2,
                                  epsilon=epsilon)


def _sgd(lr):
    return tf.train.GradientDescentOptimizer(lr)


def _momentum(lr, m):
    return tf.train.MomentumOptimizer(lr, m)


def optimize(optimizer, loss, params):
    if optimizer == 'adam':
        opt = _adam(params['lr'], params['beta1'],
                    params['beta2'], params['epsilon'])
    elif optimizer == 'sgd':
        opt = _sgd(params['lr'])
    elif optimizer == 'momentum':
        opt = _momentum(params['lr'], params['momentum'])
    else:
        raise NnvisException('Unknown optimizer: {}'.format(optimizer))

    return opt.minimize(loss)
