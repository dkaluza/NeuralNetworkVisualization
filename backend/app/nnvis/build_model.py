import tensorflow as tf
import tensorflow.contrib.layers as layers


def get_activation(node):
    if node['params']['activation'] == 'None':
        return None
    elif node['params']['activation'] == 'Sigmoid':
        return tf.sigmoid
    elif node['params']['activation'] == 'Relu':
        return tf.nn.relu
    else:
        raise Exception('Unknown activation function')


def get_padding(node):
    if node['params']['padding'] == 'Same':
        return 'SAME'
    elif node['params']['padding'] == 'Valid':
        return 'VALID'
    else:
        raise Exception('Unknown padding')


def build_input_op(node, input_ops):
    shape = node['params']['outputShape']
    return tf.placeholder(tf.float32, shape=shape)


def build_fc_op(node, input_ops):
    x = input_ops[0]
    x = layers.flatten(x)
    shape = node['params']['outputShape']
    return layers.fully_connected(x,
                num_outputs=shape[-1],
                activation_fn=get_activation(node))


def build_conv_op(node, input_ops):
    x = input_ops[0]
    shape = node['params']['outputShape']
    filters = node['params']['filterShape']
    strides = node['params']['strides']

    return layers.conv2d(x,
                num_outputs=shape[-1],
                kernel_size=filters,
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


def build_model(graph_name, nodes, links):
    ids = [int(node['id']) for node in nodes]
    nodes = {int(node['id']): node for node in nodes}

    outputs = {id: [] for id in ids}
    inputs = {id: [] for id in ids}
    num_inputs = {id: 0 for id in ids}
    for link in links:
        outputs[int(link['source'])].append(int(link['target']))
        inputs[int(link['target'])].append(int(link['source']))
        num_inputs[int(link['target'])] += 1

    graph = tf.Graph()
    with graph.as_default() as g:
        with g.name_scope(graph_name) as scope:
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

    return map_op, graph


if __name__ == '__main__':
    # simple neural network for testing
    nodes = [
            {
                'id': '1',
                'label': '1',
                'layerType': 'input',
                'params': {
                        'inputShape': [None, 28, 28, 1],
                        'outputShape': [None, 28, 28, 1]
                    }
            }, {
                'id': '2',
                'label': '2',
                'layerType': 'conv',
                'params': {
                    'inputShape': [None, 28, 28, 1],
                    'outputShape': [None, 28, 28, 16],
                    'filterShape': [3, 3],
                    'strides': [1, 1],
                    'padding': 'Same',
                    'activation': 'Relu'
                }
            }, {
                'id': '3',
                'label': '3',
                'layerType': 'fc',
                'params': {
                        'inputShape': [None, 256],
                        'outputShape': [None, 10],
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

    ops, g = build_model('my_graph', nodes, links)
    print(g.get_operations())
