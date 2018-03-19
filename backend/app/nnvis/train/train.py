import tensorflow as tf
import numpy as np
import threading
import json
import os

from flask import current_app as app
from app.nnvis.models import Architecture, Model

from app.nnvis.train import TFModel
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
        self._params = params
        self._validation_loss = 0.
        self._training_loss = 0.

    def __build_model(self):
        print('building graph...')
        self._tfmodel = TFModel(self._nodes, self._links)
        self._X = self._tfmodel.get_inputs()[0]
        self._pred = self._tfmodel.get_logits()[0]

        with self._tfmodel.get_graph().as_default():
            self._y = tf.placeholder(tf.float32, shape=(None, 10))
            self._loss = calculate_loss(self._loss_function, self._y,
                                        self._pred)
            self._opt = optimize(self._optimizer, self._loss, self._opt_params)

        self._X_shape = self.__get_shape(self._X)
        self._y_shape = self.__get_shape(self._y)

    def __get_shape(self, op):
        shape_list = op.get_shape().as_list()
        return [i if i is not None else -1 for i in shape_list]

    def __save_model(self, session, saver):
        model = Model.query.get(self._model_id)
        if model is None:
            return

        model.training_params = json.dumps(self._params)
        model.validation_loss = self._validation_loss
        model.training_loss = self._training_loss
        model.update()

        print('saving model')
        weights_dir = app.config['WEIGHTS_DIR']
        model_dir = '{arch_id}/{model_id}/' \
            .format(arch_id=self._arch_id, model_id=self._model_id)
        path = os.path.join(weights_dir, model_dir)
        saver.save(session, path + 'model.ckpt')

    def __runepoch(self, sess, ids, train=True):
        batch_losses = []
        batches = split_into_batches(ids, self._batch_size)
        for batch_ids in batches:
            batch_xs, batch_ys = read_data(self._dataset_id, batch_ids)
            batch_xs = np.reshape(batch_xs, self._X_shape)
            batch_ys = np.reshape(batch_ys, self._y_shape)
            feed_dict = {
                    self._X: batch_xs,
                    self._y: batch_ys
                    }

            if train:
                _, loss = sess.run([self._opt, self._loss],
                                   feed_dict=feed_dict)
            else:
                loss = sess.run(self._loss, feed_dict=feed_dict)
            batch_losses.append(loss)

        return np.mean(batch_losses)

    def run(self):

        train_ids = get_train_ids(self._dataset_id)
        train_ids, valid_ids = split_into_train_and_valid(train_ids, 0.7)
        self.__build_model()

        print('starting training')
        with self._tfmodel.get_graph().as_default():
            saver = tf.train.Saver()

            with tf.Session() as sess:
                sess.run(tf.global_variables_initializer())

                for e in range(self._nepochs):
                    print('---- Epoch {e} ----'.format(e=e))
                    train_ids = shuffle(train_ids)
                    average_loss = self.__runepoch(sess, train_ids, train=True)
                    self._training_loss += average_loss

                    print('[Epoch {e}] Avg. loss = {loss}'
                          .format(e=e, loss=average_loss))
                print('finished training')
                self._training_loss /= float(self._nepochs)

                print('staring validation')
                self._validation_loss = self.__runepoch(sess, valid_ids,
                                                        train=False)
                print('Validation loss = {loss}'.format(loss=average_loss))
                print('finished validation')
                self.__save_model(sess, saver)
