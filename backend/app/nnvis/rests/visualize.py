from flask_restful import Resource


class Inference(Resource):
    def get(self, model_id):
        # TODO: inference REST
        pass


class Visualize(Resource):
    def get(self, model_id, alg_id):
        # TODO: visualize REST
        pass
