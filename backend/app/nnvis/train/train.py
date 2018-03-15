import tensorflow as tf
from tensorflow.examples.tutorials.mnist import input_data
import threading
import json

from app.nnvis.models import session, Architecture

from app.nnvis.train.build_model import (build_model,
                                         get_input_ids,
                                         get_output_ids)
from app.nnvis.train.losses import calculate_loss
from app.nnvis.train.optimizers import optimize


class TrainThread(threading.Thread):
    def __init__(self, arch_id, model_id, dataset_id, params):
        threading.Thread.__init__(self)
        self._arch_id = arch_id
        self._model_id = model_id
        self._dataset_id = dataset_id
        arch = session.query(Architecture).get(arch_id)
        graph = json.loads(arch.graph)
        self._nodes = graph['nodes']
        self._links = graph['links']

        self._nepochs = params['nepochs']
        self._batch_size = params['batch_size']
        self._loss_function = params['loss']
        self._optimizer = params['optimizer']
        self._opt_params = params['optimizer_params']

    def __build_model(self):
        print('building graph...')
        self._ops = build_model(self._nodes, self._links)
        self._X = self._ops[get_input_ids(self._nodes, self._links)[0]]
        self._y = tf.placeholder(tf.float32, shape=(None, 10))
        self._pred = self._ops[get_output_ids(self._nodes, self._links)[0]]

        self._loss = calculate_loss(self._loss_function, self._y, self._pred)
        self._opt = optimize(self._optimizer, self._loss, self._opt_params)

    def run(self):
        print('starting train_mnist')
        mnist = input_data.read_data_sets(
                    '../../mnist/', one_hot=True, reshape=False)
        train = mnist.train
        test = mnist.test
        self.__build_model()

        saver = tf.train.Saver()

        with tf.Session() as sess:
            sess.run(tf.global_variables_initializer())

            for e in range(self._nepochs):
                print('---- Epoch {e} ----'.format(e=e))
                rounds = int(mnist.train.num_examples / self._batch_size)

                avarage_loss = 0.
                for i in range(rounds):
                    batch_xs, batch_ys = train.next_batch(self._batch_size)
                    _, l = sess.run(
                            [self._opt, self._loss],
                            feed_dict={self._X: batch_xs, self._y: batch_ys})

                    avarage_loss += l

                avarage_loss /= float(rounds)
                print('Avg. loss = {l}, Avg. accuracy = {a}'.format(
                    l=avarage_loss))
                avarage_loss = 0.

            path = './app/nnvis/weights/{arch_id}/{model_id}/model.ckpt' \
                .format(arch_id=self._arch_id, model_id=self._model_id)
            saver.save(sess, path)

            rounds = int(mnist.test.num_examples / self._batch_size)
            avarage_loss = 0.
            for i in range(rounds):
                batch_xs, batch_ys = test.next_batch(self._batch_size)
                _, l = sess.run(
                        [self._opt, self._loss],
                        feed_dict={self._X: batch_xs, self._y: batch_ys})

                avarage_loss += l

            print(avarage_loss / float(rounds))
        print('end train_mnist')
