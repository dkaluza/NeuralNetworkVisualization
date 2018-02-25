import tensorflow as tf
import tensorflow.contrib.layers as layers
import threading

from tensorflow.examples.tutorials.mnist import input_data

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


def get_input_ids(nodes, links):
    ids = [node['id'] for node in nodes]
    num_inputs = {id: 0 for id in ids}

    for l in links:
        num_inputs[l['target']] += 1

    return list(filter(lambda id: num_inputs[id] == 0, ids))


def get_output_ids(nodes, links):
    ids = [node['id'] for node in nodes]
    num_outputs = {id: 0 for id in ids}

    for l in links:
        num_outputs[l['source']] += 1

    return list(filter(lambda id: num_outputs[id] == 0, ids))


def calculate_logloss(y, pred):
    return tf.losses.log_loss(y, pred)


def calculate_accuracy(y, pred):
    n = tf.equal(tf.argmax(y, 1), tf.argmax(pred, 1))
    return tf.reduce_mean(tf.cast(n, tf.float32))


def minimize_with_adam(loss):
    return tf.train.AdamOptimizer().minimize(loss)


class TrainMnistThread(threading.Thread):
    def __init__(self, nodes, links):
        threading.Thread.__init__(self)
        self.nodes = nodes
        self.links = links

    def run(self):
        print('starting train_mnist')
        EPOCHS = 10
        BATCH_SIZE = 32
        mnist = input_data.read_data_sets('../../mnist/', one_hot=True, reshape=False)

        print('building graph...')
        ops = build_model(self.nodes, self.links)
        X = ops[get_input_ids(self.nodes, self.links)[0]]
        y = tf.placeholder(tf.float32, shape=(None, 10))
        pred = ops[get_output_ids(self.nodes, self.links)[0]]
        loss = calculate_logloss(y, pred)
        acc = calculate_accuracy(y, pred)
        opt = minimize_with_adam(loss)

        with tf.Session() as sess:
            sess.run(tf.global_variables_initializer())

            for e in range(EPOCHS):
                print('---- Epoch {e} ----'.format(e=e))
                rounds = int(mnist.train.num_examples / BATCH_SIZE)

                avarage_loss = 0.
                avarage_accuracy = 0.
                cnt = 0
                for i in range(rounds):
                    batch_xs, batch_ys = mnist.train.next_batch(BATCH_SIZE)
                    _, l, a = sess.run([opt, loss, acc], feed_dict={X: batch_xs, y: batch_ys})

                    avarage_loss += l
                    avarage_accuracy += a
                    cnt += 1
                    if cnt == 100:
                        avarage_loss /= float(cnt)
                        avarage_accuracy /= float(cnt)
                        print('Avg. loss = {l}, Avg. accuracy = {a}'.format(l=avarage_loss, a=avarage_accuracy))
                        avarage_loss = 0.
                        avarage_accuracy = 0.
                        cnt = 0

            rounds = int(mnist.test.num_examples / BATCH_SIZE)
            avarage_loss = 0.
            avarage_accuracy = 0.
            cnt = 0
            for i in range(100):
                batch_xs, batch_ys = mnist.test.next_batch(BATCH_SIZE)
                _, l, a = sess.run([opt, loss, acc], feed_dict={X: batch_xs, y: batch_ys})

                avarage_loss += l
                avarage_accuracy += a
                cnt += 1

            print(avarage_loss / float(cnt))
            print(avarage_accuracy / float(cnt))
        print('end train_mnist')


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
        thread1 = TrainMnistThread(nodes, links)
        thread1.start()
        thread1.join()
    except:
        print('Error: unable to start thread')
