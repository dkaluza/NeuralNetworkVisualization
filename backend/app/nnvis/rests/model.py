from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user

from app.nnvis.models import session, Model, Architecture
from app.nnvis.rests.protected_resource import ProtectedResource


def model_to_dict(model):
    return {
        'id': model.id,
        'name': model.name,
        'description': model.description
    }


class ModelTask(ProtectedResource):
    def __abort_if_model_doesnt_exist(self, model, model_id):
        if model is None:
            message = 'Model {id} doesn\'t exist' \
                      .format(id=model_id)
            abort(403, message=message)

    def __abort_if_model_isnt_owned_by_user(self, model):
        if model.architecture.user_id != get_current_user():
            message = "Model {id} isn't owned by the user".format(
                id=model.id)
            abort(401, message=message)

    def get(self, model_id):
        model = session.query(Model).get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)
        return model_to_dict(model)

    def delete(self, model_id):
        model = session.query(Model).get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)
        model.delete()
        return '', 204

    def post(self, model_id):
        model = session.query(Model).get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)

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
        arch = session.query(Architecture).get(arch_id)
        if arch is None:
            return []
        if arch.user_id != get_current_user():
            message = "Architecture {id} isn't owned by the user".format(
                id=arch_id)
            abort(401, message=message)

        models = arch.models
        return [model_to_dict(model) for model in models]
