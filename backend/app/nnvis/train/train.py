import tensorflow as tf
import numpy as np
import threading
import json

from app.nnvis.models import Architecture

from app.nnvis.train.build_model import (build_model,
                                         get_input_ids,
                                         get_output_ids)
from app.nnvis.train.losses import calculate_loss
from app.nnvis.train.optimizers import optimize
from app.nnvis.train.read_dataset import (read_data,
                                          get_train_ids,
                                          shuffle,
                                          split_into_batches,
                                          split_into_train_and_valid)


class TrainThread(threading.Thread):
    def __init__(self, arch_id, model_id, dataset_id, params):
        threading.Thread.__init__(self)
        self._arch_id = arch_id
        self._model_id = model_id
        self._dataset_id = dataset_id
        arch = Architecture.query.get(arch_id)
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
        self._ops, self._graph = build_model(self._nodes, self._links)
        self._X = self._ops[get_input_ids(self._nodes, self._links)[0]]
        self._pred = self._ops[get_output_ids(self._nodes, self._links)[0]]

        with self._graph.as_default():
            self._y = tf.placeholder(tf.float32, shape=(None, 10))
            self._loss = calculate_loss(self._loss_function, self._y,
                                        self._pred)
            self._opt = optimize(self._optimizer, self._loss, self._opt_params)

    def __get_shape(self, op):
        l = op.get_shape().as_list()
        return [i if i is not None else -1 for i in l]

    def run(self):

        train_ids = get_train_ids(self._dataset_id)
        train_ids, valid_ids = split_into_train_and_valid(train_ids, 0.7)
        self.__build_model()

        print('starting training')
        with self._graph.as_default():
            saver = tf.train.Saver()

            with tf.Session() as sess:
                sess.run(tf.global_variables_initializer())

                x_shape = self.__get_shape(self._X)
                y_shape = self.__get_shape(self._y)

                rounds = int(len(train_ids) / self._batch_size)
                for e in range(self._nepochs):
                    print('---- Epoch {e} ----'.format(e=e))
                    train_ids = shuffle(train_ids)

                    avarage_loss = 0.
                    batches = split_into_batches(train_ids, self._batch_size)
                    for batch_ids in batches:
                        batch_xs, batch_ys = read_data(self._dataset_id,
                                                       batch_ids)
                        batch_xs = np.reshape(batch_xs, x_shape)
                        batch_ys = np.reshape(batch_ys, y_shape)
                        _, l = sess.run(
                                [self._opt, self._loss],
                                feed_dict={
                                    self._X: batch_xs,
                                    self._y: batch_ys
                                    }
                                )

                        avarage_loss += l

                    avarage_loss /= float(rounds)
                    print('Avg. loss = {l}'.format(l=avarage_loss))
                    avarage_loss = 0.
                print('finished training')

                print('saving model')
                path = './app/nnvis/weights/{arch_id}/{model_id}/model.ckpt' \
                    .format(arch_id=self._arch_id, model_id=self._model_id)
                saver.save(sess, path)

                print('staring validation')
                rounds = int(len(valid_ids) / self._batch_size)
                avarage_loss = 0.
                batches = split_into_batches(valid_ids, self._batch_size)
                for batch_ids in batches:
                    batch_xs, batch_ys = read_data(self._dataset_id, batch_ids)
                    batch_xs = np.reshape(batch_xs, x_shape)
                    batch_ys = np.reshape(batch_ys, y_shape)
                    _, l = sess.run(
                            [self._opt, self._loss],
                            feed_dict={self._X: batch_xs, self._y: batch_ys}
                            )

                    avarage_loss += l

                print(avarage_loss / float(rounds))
                print('finished validation')
