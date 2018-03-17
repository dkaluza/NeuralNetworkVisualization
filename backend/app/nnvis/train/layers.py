import tensorflow as tf
import tensorflow.contrib.layers as layers


def get_activation(node):
    activation = node['params']['activation']
    if activation == 'None':
        return None
    elif activation == 'Sigmoid':
        return tf.sigmoid
    elif activation == 'Relu':
        return tf.nn.relu
    else:
        raise Exception('Unknown activation function: {}'.format(activation))


def get_padding(node):
    padding = node['params']['padding']
    if padding == 'Same':
        return 'SAME'
    elif padding == 'Valid':
        return 'VALID'
    else:
        raise Exception('Unknown padding: {}'.format(padding))


def build_input_op(node, input_ops):
    shape = node['params']['outputShape']
    shape = [d if d > 0 else None for d in shape]
    return tf.placeholder(tf.float32, shape=shape)


def build_fc_op(node, input_ops):
    x = input_ops[0]
    x = layers.flatten(x)
    return layers.fully_connected(
            x, num_outputs=node['params']['numOutputs'],
            activation_fn=get_activation(node))


def build_conv_op(node, input_ops):
    x = input_ops[0]
    num_filters = node['params']['numFilters']
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    return layers.conv2d(
            x, num_outputs=num_filters,
            kernel_size=kernel_size,
            stride=strides,
            padding=get_padding(node),
            activation_fn=get_activation(node))


def build_pool_op(node, input_ops):
    x = input_ops[0]
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    if node['params']['pool'] == 'Max':
        return layers.max_pool2d(x,
                                 kernel_size=kernel_size,
                                 stride=strides,
                                 padding=get_padding(node))
    elif node['params']['pool'] == 'Avarage':
        return layers.avg_pool2d(x,
                                 kernel_size=kernel_size,
                                 stride=strides,
                                 padding=get_padding(node))
    else:
        raise Exception('Unkown pool: {}'.format(node['params']['pool']))


def build_op(node, map_op, inputs):
    input_ops = [map_op[v] for v in inputs]

    with tf.name_scope(node['id']):
        if node['layerType'] == 'input':
            return build_input_op(node, input_ops)
        elif node['layerType'] == 'fc':
            return build_fc_op(node, input_ops)
        elif node['layerType'] == 'conv':
            return build_conv_op(node, input_ops)
        elif node['layerType'] == 'pool':
            return build_pool_op(node, input_ops)
        else:
            raise Exception('Unknown type of layer')
