from flask import request
from flask_restful import abort

from app.nnvis.models import Model
from app.nnvis.rests.protected_resource import ProtectedResource


def model_to_dict(model):
    return {
        'id': model.id,
        'name': model.name,
        'description': model.description
    }


class ModelTask(ProtectedResource):
    def __abort_if_model_doesnt_exist(self, model_id):
        if Model.query.get(model_id) is None:
            message = 'Model {id} doesn\'t exist' \
                      .format(id=model_id)
            abort(403, message=message)

    def get(self, model_id):
        self.__abort_if_model_doesnt_exist(model_id)
        model = Model.query.get(model_id)
        return model_to_dict(model)

    def delete(self, model_id):
        self.__abort_if_model_doesnt_exist(model_id)
        model = Model.query.get(model_id)
        model.delete()
        return '', 204

    def post(self, model_id):
        self.__abort_if_model_doesnt_exist(model_id)
        model = Model.query.get(model_id)

        args = request.get_json(force=True)
        if 'name' in args:
            model.name = args['name']
        if 'description' in args:
            model.description = args['description']

        model.update()
        return model_to_dict(model), 201


class UploadNewModel(ProtectedResource):
    def post(self, arch_id):
        # TODO: upload_new_model REST
        pass


class ListAllModels(ProtectedResource):
    def get(self, arch_id):
        models = Model.query.filter_by(arch_id=arch_id)
        return [model_to_dict(model) for model in models]
