import tensorflow as tf


def adam(lr, beta1, beta2, epsilon):
    return tf.train.AdamOptimizer(learning_rate=lr,
                                  beta1=beta1,
                                  beta2=beta2,
                                  epsilon=epsilon)


def sgd(lr):
    return tf.train.GradientDescentOptimizer(lr)


def momentum(lr, m):
    return tf.train.MomentumOptimizer(lr, m)


def optimize(optimizer, loss, params):
    if optimizer == 'adam':
        opt = adam(params['lr'], params['beta1'],
                   params['beta2'], params['epsilon'])
    elif optimizer == 'sgd':
        opt = sgd(params['lr'])
    elif optimizer == 'momentum':
        opt = momentum(params['lr'], params['momentum'])
    else:
        raise Exception('Unknown optimizer: {}'.format(optimizer))

    return opt.minimize(loss)
