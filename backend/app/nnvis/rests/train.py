from flask_restful import Resource
import json

import tensorflow as tf
from tensorflow.examples.tutorials.mnist import input_data

from app.nnvis.models import Architecture
from app.nnvis.build_model import TrainMnistThread

class TrainNewModel(Resource):
    def get(self, arch_id, dataset_id):
        arch = Architecture.query.get(arch_id)
        graph = json.loads(arch.graph)
        nodes = graph['nodes']
        links = graph['links']

        try:
            thread1 = TrainMnistThread(nodes, links)
            thread1.start()
            # thread1.join()
        except:
            print('Error: unable to start thread')

        return {'ok': 'ok'}, 200


class TrainModel(Resource):
    def get(self, model_id, dataset_id):
        # TODO: train_model REST
        pass
