import tensorflow as tf

from app.utils import NnvisException


def _param(name, id, value):
    return {'name': name, 'id': id, 'value': value}


def _optimizer(name, id, params):
    return {
            'name': name,
            'id': id,
            'params': [_param(param[0], param[1], param[2])
                       for param in params]
            }


OPTIMIZERS_LIST = [
        _optimizer('Adam', 'adam',
                   [('Learning rate', 'lr', 0.001),
                    ('Beta 1', 'beta1', 0.9),
                    ('Beta 2', 'beta2', 0.999),
                    ('Epsilon', 'epsilon', 1e-8)]),
        _optimizer('Gradient descent', 'sgd',
                   [('Learning rate', 'lr', 0.1)]),
        _optimizer('Momentum', 'momentum',
                   [('Learning rate', 'lr', 0.1),
                    ('Momentum', 'momentum', 0.9)]),
        _optimizer('Adagrad', 'adagrad',
                   [('Learning rate', 'lr', 0.1)]),
        _optimizer('Adadelta', 'adadelta',
                   [('Learning rate', 'lr', 0.001),
                    ('Decay', 'decay', 0.95),
                    ('Epsilon', 'epsilon', 1e-08)]),
        _optimizer('RMSProp', 'rmsprop',
                   [('Learning rate', 'lr', 0.001),
                    ('Decay', 'decay', 0.9),
                    ('Momentum', 'momentum', 0.0),
                    ('Epsilon', 'epsilon', 1e-10)])
    ]


def get_optimizer(id):
    return list(filter(
        lambda opt: opt['id'] == id,
        OPTIMIZERS_LIST))[0]


def _adam(params):
    return tf.train.AdamOptimizer(
            learning_rate=params['lr'],
            beta1=params['beta1'],
            beta2=params['beta2'],
            epsilon=params['epsilon'])


def _sgd(params):
    lr = params['lr']
    return tf.train.GradientDescentOptimizer(lr)


def _momentum(params):
    lr = params['lr']
    m = params['momentum']
    return tf.train.MomentumOptimizer(lr, m)


def _adagrad(params):
    lr = params['lr']
    return tf.train.AdagradOptimizer(lr)


def _adadelta(params):
    return tf.train.AdadeltaOptimizer(
                learning_rate=params['lr'],
                rho=params['decay'],
                epsilon=params['epsilon'])


def _rmsprop(params):
    return tf.train.RMSPropOptimizer(
                learning_rate=params['lr'],
                decay=params['decay'],
                momentum=params['momentum'],
                epsilon=params['epsilon'])


def optimize(optimizer, loss, params):
    optimizers = {
        'adam': _adam,
        'sgd': _sgd,
        'momentum': _momentum,
        'adagrad': _adagrad,
        'adadelta': _adadelta,
        'rmsprop': _rmsprop
    }

    opt = optimizers.get(optimizer)
    if opt is None:
        raise NnvisException('Unknown optimizer: {}'.format(optimizer))

    """
    Necessary for batch norm to work properly
    """
    update_ops = tf.get_collection(tf.GraphKeys.UPDATE_OPS)
    with tf.control_dependencies(update_ops):
        return opt(params).minimize(loss)
