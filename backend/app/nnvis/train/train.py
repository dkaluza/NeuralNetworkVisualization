import tensorflow as tf
import numpy as np
import threading
import time
import json
import os

from flask import current_app as app
from app.nnvis.models import Architecture, Model, Dataset, TrainingHistory

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
        dataset = Dataset.query.get(dataset_id)
        self._num_labels = len(dataset.labels.split(','))
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

        self.app_ctx = app.app_context()

    def __build_model(self):
        self._tfmodel = TFModel(self._nodes, self._links)
        self._X = self._tfmodel.get_inputs()
        self._pred = self._tfmodel.get_output()
        self._is_training = self._tfmodel.get_is_training()

        with self._tfmodel.get_graph().as_default():
            self._y = tf.placeholder(tf.float32,
                                     shape=(None, self._num_labels))
            self._loss = calculate_loss(self._loss_function, self._y,
                                        self._pred)
            self._opt = optimize(self._optimizer, self._loss, self._opt_params)

            pred = tf.argmax(self._pred, 1)
            eq = tf.equal(pred, tf.argmax(self._y, 1))
            self._acc = tf.reduce_mean(tf.cast(eq, tf.float32))

        self._X_shapes = [self.__get_shape(x) for x in self._X]
        self._y_shape = self.__get_shape(self._y)

    def __get_shape(self, op):
        shape_list = op.get_shape().as_list()
        return [i if i is not None else -1 for i in shape_list]

    def __save_model(self, session, saver):
        model = Model.query.get(self._model_id)
        if model is None:
            return

        weights_dir = app.config['WEIGHTS_DIR']
        model_dir = '{arch_id}/{model_id}/' \
            .format(arch_id=self._arch_id, model_id=self._model_id)
        path = os.path.join(weights_dir, model_dir)
        saver.save(session, path + 'model.ckpt')

        model.training_params = json.dumps(self._params)
        model.validation_loss = self._validation_loss
        model.training_loss = self._training_loss
        model.weights_path = path
        model.update()

    def __runepoch(self, sess, ids, train=True):
        epoch_loss = 0.
        epoch_acc = 0.
        batches = split_into_batches(ids, self._batch_size)
        for batch_ids in batches:
            batch_xs, batch_y = read_data(self._dataset_id, batch_ids)
            batch_xs = [np.reshape(bx, xshape)
                        for bx, xshape in zip(batch_xs, self._X_shapes)]
            batch_y = np.reshape(batch_y, self._y_shape)
            feed_dict = {
                x: batch_x for x, batch_x in zip(self._X, batch_xs)
            }
            feed_dict[self._y] = batch_y
            feed_dict[self._is_training] = train

            if train:
                _, loss, acc = sess.run([self._opt, self._loss, self._acc],
                                        feed_dict=feed_dict)
            else:
                loss, acc = sess.run([self._loss, self._acc],
                                     feed_dict=feed_dict)

            epoch_loss += float(self._batch_size) * loss
            epoch_acc += float(self._batch_size) * acc

        epoch_loss /= float(len(ids))
        epoch_acc /= float(len(ids))
        return epoch_loss, epoch_acc

    def run(self):
        with self.app_ctx:
            try:
                train_ids = get_train_ids(self._dataset_id)
                train_ids, valid_ids =\
                    split_into_train_and_valid(train_ids, 0.7)
                self.__build_model()

                training_history = TrainingHistory(self._model_id, self._batch_size, 0,
                                                   self._nepochs, self._training_loss,
                                                   self._validation_loss)
                training_history.add()
                start_time = time.time()
                with self._tfmodel.get_graph().as_default():
                    saver = tf.train.Saver()

                    with tf.Session() as sess:
                        sess.run(tf.global_variables_initializer())

                        for e in range(self._nepochs):
                            start_epoch = time.time()
                            train_ids = shuffle(train_ids)
                            average_loss, average_acc = self.__runepoch(
                                sess, train_ids, train=True)
                            self._training_loss += average_loss
                            end_epoch = time.time()

                            self.__update_history(training_history, e + 1)

                        self._training_loss /= float(self._nepochs)

                        self._validation_loss, average_acc = self.__runepoch(
                            sess, valid_ids, train=False)
                              .format(loss=self._validation_loss))
                        training_history.validation_loss=self._validation_loss
                        training_history.update()

                        self.__save_model(sess, saver)
                end_time=time.time()
            except:
                Model.query.get(self._model_id).delete()
                raise

    def __update_history(self, training_history, current_epoch):
        training_history.training_loss=self._training_loss
        training_history.current_epoch=current_epoch
        training_history.update()
