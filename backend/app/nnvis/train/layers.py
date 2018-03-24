import tensorflow as tf
import tensorflow.contrib.layers as layers

from app.utils import NnvisException


def _get_activation(node):
    activation = node['params']['activation']
    if activation == 'None':
        return None
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


def _build_input_op(node, input_ops):
    shape = node['params']['outputShape']
    shape = [d if d > 0 else None for d in shape]
    return tf.placeholder(tf.float32, shape=shape,
                          name=str(node['params']['inputId']))


def _build_fc_op(node, input_ops):
    x = input_ops[0]
    x = layers.flatten(x)
    return layers.fully_connected(
            x, num_outputs=node['params']['numOutputs'],
            activation_fn=_get_activation(node),
            scope=node['id'])


def _build_conv_op(node, input_ops):
    x = input_ops[0]
    num_filters = node['params']['numFilters']
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    return layers.conv2d(
            x, num_outputs=num_filters,
            kernel_size=kernel_size,
            stride=strides,
            padding=_get_padding(node),
            activation_fn=_get_activation(node),
            scope=node['id'])


def _build_pool_op(node, input_ops):
    x = input_ops[0]
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    if node['params']['pool'] == 'Max':
        return layers.max_pool2d(x,
                                 kernel_size=kernel_size,
                                 stride=strides,
                                 padding=_get_padding(node),
                                 scope=node['id'])
    elif node['params']['pool'] == 'Avarage':
        return layers.avg_pool2d(x,
                                 kernel_size=kernel_size,
                                 stride=strides,
                                 padding=_get_padding(node),
                                 scope=node['id'])
    else:
        raise NnvisException('Unkown pool: {}'.format(node['params']['pool']))


def _build_dropout_op(node, input_ops):
    x = input_ops[0]
    keep_prob = float(node['params']['keepProb'])
    return layers.dropout(x, keep_prob=keep_prob)


def _build_batch_norm_op(node, input_ops):
    x = input_ops[0]
    return layers.batch_norm(
            x,
            decay=node['params']['decay'],
            center=node['params']['center'],
            scale=node['params']['scale']
            )


def build_op(node, map_op, inputs):
    input_ops = [map_op[v] for v in inputs]

    with tf.name_scope(node['layerType']):
        if node['layerType'] == 'input':
            return _build_input_op(node, input_ops)
        elif node['layerType'] == 'fc':
            return _build_fc_op(node, input_ops)
        elif node['layerType'] == 'conv':
            return _build_conv_op(node, input_ops)
        elif node['layerType'] == 'pool':
            return _build_pool_op(node, input_ops)
        elif node['layerType'] == 'dropout':
            return _build_dropout_op(node, input_ops)
        elif node['layerType'] == 'batch_norm':
            return _build_batch_norm_op(node, input_ops)
        else:
            raise NnvisException('Unknown type of layer')
