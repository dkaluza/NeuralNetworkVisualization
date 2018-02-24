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
    return layers.fully_connected(x,
                num_outputs=node['params']['numOutputs'],
                activation_fn=get_activation(node))


def build_conv_op(node, input_ops):
    x = input_ops[0]
    num_filters = node['params']['numFilters']
    kernel_size = node['params']['kernelShape']
    strides = node['params']['strides']

    return layers.conv2d(x,
                num_outputs=num_filters,
                kernel_size=kernel_size,
                stride=strides,
                padding=get_padding(node),
                activation_fn=get_activation(node))


def build_op(node, map_op, inputs):
    input_ops = [map_op[v] for v in inputs]

    if node['layerType'] == 'input':
        return build_input_op(node, input_ops)
    elif node['layerType'] == 'fc':
        return build_fc_op(node, input_ops)
    elif node['layerType'] == 'conv':
        return build_conv_op(node, input_ops)
    else:
        raise Exception('Unknown type of layer')


def build_model(nodes, links):
    ids = [int(node['id']) for node in nodes]
    nodes = {int(node['id']): node for node in nodes}

    outputs = {id: [] for id in ids}
    inputs = {id: [] for id in ids}
    num_inputs = {id: 0 for id in ids}
    for link in links:
        outputs[int(link['source'])].append(int(link['target']))
        inputs[int(link['target'])].append(int(link['source']))
        num_inputs[int(link['target'])] += 1

    map_op = {}
    for id in ids:
        if num_inputs[id] == 0 and id not in map_op:
            stack = [id]
            while stack:
                v = stack.pop()
                map_op[v] = build_op(nodes[v], map_op, inputs[v])
                for u in outputs[v]:
                    num_inputs[u] -= 1
                    if num_inputs[u] == 0:
                        stack.append(u)

    for v in ids:
        assert(num_inputs[v] == 0)

    ret = {}
    for k, v in map_op.items():
        ret[str(k)] = v

    return ret


if __name__ == '__main__':
    # simple neural network for testing
    nodes = [
            {
                'id': '1',
                'label': '1',
                'layerType': 'input',
                'params': {
                        'inputShape': [-1, 28, 28, 1],
                        'outputShape': [-1, 28, 28, 1]
                    }
            }, {
                'id': '2',
                'label': '2',
                'layerType': 'conv',
                'params': {
                    'inputShape': [-1, 28, 28, 1],
                    'outputShape': [-1, 28, 28, 16],
                    'numFilters': 16,
                    'kernelShape': [3, 3],
                    'strides': [1, 1],
                    'padding': 'Same',
                    'activation': 'Relu'
                }
            }, {
                'id': '3',
                'label': '3',
                'layerType': 'fc',
                'params': {
                        'inputShape': [-1, 256],
                        'outputShape': [-1, 10],
                        'numOutputs': 10,
                        'activation': 'Sigmoid'
                    }
            },
            ]

    links = [
            {
                'source': '1', 'target': '2'
            }, {
                'source': '2', 'target': '3'
            }
            ]

    try:
        ops = build_model(nodes, links)
        print(ops)
    except Exception as e:
        print(e)
