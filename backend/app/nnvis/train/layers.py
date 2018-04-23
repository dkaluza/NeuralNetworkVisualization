import tensorflow as tf
import tensorflow.contrib.layers as layers

from app.utils import NnvisException


def _get_activation(node):
    activation = node['params']['activation']
    if activation == 'None':
        return tf.identity
    elif activation == 'Sigmoid':
        return tf.sigmoid
    elif activation == 'Relu':
        return tf.nn.relu
    else:
        raise NnvisException('Unknown activation function: {}'
                             .format(activation))


def _get_padding(node):
    padding = node['params']['padding']
    if padding == 'Same':
        return 'SAME'
    elif padding == 'Valid':
        return 'VALID'
    else:
        raise NnvisException('Unknown padding: {}'.format(padding))


def _build_input_op(node, input_ops, is_training):
    shape = node['params']['shape']
    shape = [d if d > 0 else None for d in shape]
    inputId = node['params']['inputId']
    op = tf.placeholder(tf.float32, shape=shape,
                        name='input/{0}'.format(inputId))
    # add new name for logits tensor
    tf.identity(op, name='{0}/logits'.format(node['id']))
    return op


def _build_fc_op(node, input_ops, is_training):
    x = input_ops[0]
    x = layers.flatten(x)
    with tf.name_scope(node['id']):
        scope = str(node['weightId'])
        op = layers.fully_connected(
                x, num_outputs=node['params']['numOutputs'],
                activation_fn=tf.identity,
                reuse=tf.AUTO_REUSE,
                scope=scope)
        # add new name for logits tensor
        tf.identity(op, name='logits')
        return _get_activation(node)(op, name=node['params']['activation'])


def _build_conv_op(node, input_ops, is_training):
    x = input_ops[0]
    num_filters = node['params']['numFilters']
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    with tf.name_scope(node['id']):
        scope = str(node['weightId'])
        op = layers.conv2d(
                x, num_outputs=num_filters,
                kernel_size=kernel_size,
                stride=strides,
                padding=_get_padding(node),
                activation_fn=tf.identity,
                reuse=tf.AUTO_REUSE,
                scope=scope)
        # add new name for logits tensor
        tf.identity(op, name='logits')
        return _get_activation(node)(op, name=node['params']['activation'])


def _build_pool_op(node, input_ops, is_training):
    x = input_ops[0]
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    with tf.name_scope(node['id']):
        if node['params']['pool'] == 'Max':
            pool_op = layers.max_pool2d(
                    x,
                    kernel_size=kernel_size,
                    stride=strides,
                    padding=_get_padding(node))
        elif node['params']['pool'] == 'Avarage':
            pool_op = layers.avg_pool2d(
                    x,
                    kernel_size=kernel_size,
                    stride=strides,
                    padding=_get_padding(node))
        else:
            raise NnvisException('Unkown pool: {}'
                                 .format(node['params']['pool']))
        # add new name for logits tensor
        tf.identity(pool_op, name='logits')
        return pool_op


def _build_dropout_op(node, input_ops, is_training):
    x = input_ops[0]
    keep_prob = float(node['params']['keepProb'])
    keep_prob = tf.where(is_training, keep_prob, 1.0)
    with tf.name_scope(node['id']):
        op = layers.dropout(x, keep_prob=keep_prob)
        # add new name for logits tensor
        tf.identity(op, name='logits')
        return op


def _build_batch_norm_op(node, input_ops, is_training):
    x = input_ops[0]
    with tf.name_scope(node['id']):
        op = layers.batch_norm(
                x,
                decay=node['params']['decay'],
                center=node['params']['center'],
                scale=node['params']['scale'],
                is_training=is_training
                )
        # add new name for logits tensor
        tf.identity(op, name='logits')
        return op


def _build_add_op(node, input_ops, is_training):
    with tf.name_scope(node['id']):
        return tf.add_n(input_ops, name='logits')


def _build_concat_op(node, input_ops, is_training):
    with tf.name_scope(node['id']):
        axis = int(node['params']['axis'])
        return tf.concat(input_ops, axis=axis, name='logits')


def _build_softmax_op(node, input_ops, is_training):
    x = input_ops[0]
    axis = int(node['params']['axis'])
    with tf.name_scope(node['id']):
        # add new name for lofits tensor
        tf.identity(x, name='logits')
        return tf.nn.softmax(x, axis=axis)


def build_op(node, map_op, inputs, is_training):
    input_ops = [map_op[v] for v in inputs]

    ops = {
        'input': _build_input_op,
        'fc': _build_fc_op,
        'conv': _build_conv_op,
        'pool': _build_pool_op,
        'dropout': _build_dropout_op,
        'batch_norm': _build_batch_norm_op,
        'add': _build_add_op,
        'concat': _build_concat_op,
        'softmax': _build_softmax_op
    }
    op = ops.get(node['layerType'])
    if op is None:
        raise NnvisException('Unknown type of layer')

    return op(node, input_ops, is_training)
