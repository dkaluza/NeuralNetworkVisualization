from app.nnvis.rests.protected_resource import ProtectedResource


class TrainNewModel(ProtectedResource):
    def get(self, arch_id, dataset_id):
        # TODO: train_new_model REST
        pass


class TrainModel(ProtectedResource):
    def get(self, model_id, dataset_id):
        # TODO: train_model REST
        pass
