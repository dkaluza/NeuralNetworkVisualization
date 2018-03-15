import tensorflow as tf


def adam(lr, beta1, beta2, epsilon):
    return tf.train.AdamOptimizer(learning_rate=lr,
                                  beta1=beta1,
                                  beta2=beta2,
                                  epsilon=epsilon)


def optimize(optimizer, loss, params):
    if optimizer == 'adam':
        opt = adam(loss, params['lr'], params['beta1'],
                   params['beta2'], params['epsilon'])
    else:
        raise Exception('Unknown optimizer: {}'.format(optimizer))

    return opt.minimize(loss)
