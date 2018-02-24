from flask_restful import Resource
import json

from app.nnvis.models import Architecture
from app.nnvis.build_model import build_model


class TrainNewModel(Resource):
    def get(self, arch_id, dataset_id):
        arch = Architecture.query.get(arch_id)
        graph = json.loads(arch.graph)

        ops = build_model(graph['nodes'], graph['links'])
        print(ops)

        return {'ok': 'ok'}, 200


class TrainModel(Resource):
    def get(self, model_id, dataset_id):
        # TODO: train_model REST
        pass
