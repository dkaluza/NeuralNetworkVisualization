from flask_restful import Resource


class TrainNewModel(Resource):
    def get(self, arch_id, dataset_id):
        # TODO: train_new_model REST
        pass


class TrainModel(Resource):
    def get(self, model_id, dataset_id):
        # TODO: train_model REST
        pass
