from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user
import json
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO

from app.utils import NnvisException, fileToB64
from app.nnvis.models import Model, Architecture
from app.nnvis.rests.protected_resource import ProtectedResource

from app.nnvis.train.losses import get_loss
from app.nnvis.train.optimizers import get_optimizer


class ModelUtils:
    def _model_to_dict(self, model):
        if model.training_params is not None:
            params = json.loads(model.training_params)
            params['loss'] = get_loss(params['loss'])['name']

            opt = get_optimizer(params['optimizer'])
            params['optimizer'] = opt['name']
            params['optimizer_params'] = [
                {
                    'name': p['name'],
                    'value': params['optimizer_params'][p['id']]
                }
                for p in opt['params']
            ]
        else:
            params = {
                    'loss': 'none',
                    'optimizer': 'none',
                    'optimizer_params': None,
                    'batch_size': None,
                    'nepochs': None,
                    }

        return {
            'id': model.id,
            'name': model.name,
            'description': model.description,
            'valid_loss': model.validation_loss,
            'train_loss': model.training_loss,
            'loss': params['loss'],
            'optimizer': params['optimizer'],
            'optimizer_params': params['optimizer_params'],
            'batch_size': params['batch_size'],
            'nepochs': params['nepochs']
        }

    def _abort_if_model_doesnt_exist(self, model, model_id):
        if model is None:
            message = 'Model {id} doesn\'t exist' \
                      .format(id=model_id)
            abort(403, message=message)

    def _abort_if_model_isnt_owned_by_user(self, model):
        if model.architecture.user_id != get_current_user():
            message = "Model {id} isn't owned by the user".format(
                id=model.id)
            abort(401, message=message)


class ModelTask(ProtectedResource, ModelUtils):
    def get(self, model_id):
        model = Model.query.get(model_id)
        self._abort_if_model_doesnt_exist(model, model_id)
        self._abort_if_model_isnt_owned_by_user(model)
        return self._model_to_dict(model)

    def delete(self, model_id):
        model = Model.query.get(model_id)
        self._abort_if_model_doesnt_exist(model, model_id)
        self._abort_if_model_isnt_owned_by_user(model)
        model.delete()
        return '', 204

    def post(self, model_id):
        model = Model.query.get(model_id)
        self._abort_if_model_doesnt_exist(model, model_id)
        self._abort_if_model_isnt_owned_by_user(model)

        args = request.get_json(force=True)
        if 'name' in args:
            model.name = args['name']
        if 'description' in args:
            model.description = args['description']

        model.update()
        return self._model_to_dict(model), 201


class UploadNewModel(ProtectedResource, ModelUtils):
    def post(self, arch_id):
        # TODO: upload_new_model REST
        pass


class ListAllModels(ProtectedResource, ModelUtils):
    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)
        if arch is None:
            return []
        if arch.user_id != get_current_user():
            message = "Architecture {id} isn't owned by the user".format(
                id=arch_id)
            abort(401, message=message)

        models = arch.models
        return [self._model_to_dict(model) for model in models]


class ExportModel(ProtectedResource, ModelUtils):
    def get(self, model_id):
        model = Model.query.get(model_id)
        self._abort_if_model_doesnt_exist(model, model_id)
        self._abort_if_model_isnt_owned_by_user(model)

        try:
            data_file = model.get_data_file_path()
            index_file = model.get_index_file_path()
            meta_file = Architecture.query.get(model.arch_id)\
                .get_meta_file_path()
        except NnvisException:
            return {}, 400

        name = model.name.replace(' ', '_') + '.{}'
        data_name = name.format('ckpt.data-00000-of-00001')
        index_name = name.format('ckpt.index')
        meta_name = name.format('meta')

        # create zip file
        bytestr = BytesIO()
        with ZipFile(bytestr, mode="x", compression=ZIP_DEFLATED) as zipfile:
            zipfile.write(data_file, data_name)
            zipfile.write(index_file, index_name)
            zipfile.write(meta_file, meta_name)
        bytestr.seek(0)

        zip_name = name.format('zip')
        zip_b64 = fileToB64(bytestr)

        return {
                'filename': zip_name,
                'file': zip_b64
                }
