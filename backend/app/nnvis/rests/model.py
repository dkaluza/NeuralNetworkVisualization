from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user
import json
import os
from zipfile import ZipFile

from flask import current_app as app
from app.nnvis.models import Model, Architecture
from app.nnvis.rests.protected_resource import ProtectedResource


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
        model = Model.query.get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)
        return model.to_dict()

    def delete(self, model_id):
        model = Model.query.get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)
        model.delete()
        return '', 204

    def post(self, model_id):
        model = Model.query.get(model_id)
        self.__abort_if_model_doesnt_exist(model, model_id)
        self.__abort_if_model_isnt_owned_by_user(model)

        args = request.get_json(force=True)
        if 'name' in args:
            model.name = args['name']
        if 'description' in args:
            model.description = args['description']

        model.update()
        return model.to_dict(), 201


class UploadNewModel(ProtectedResource):
    def post(self, arch_id):
        # TODO: upload_new_model REST
        pass


class ListAllModels(ProtectedResource):
    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)
        if arch is None:
            return []
        if arch.user_id != get_current_user():
            message = "Architecture {id} isn't owned by the user".format(
                id=arch_id)
            abort(401, message=message)

        models = arch.models
        return [model.to_dict() for model in models]


class ImportModel(ProtectedResource):
    def __verify_postdata(self, data):
        if 'arch_name' not in data:
            abort(400, 'Architecture name is required')
        if 'model_name' not in data:
            abort(400, 'Model name is required')

    def __verify_zip(self, zipdata):
        files = zipdata.namelist()
        if len(files) != 3:
            abort(400, 'Wrong number of files')

        meta_files = list(filter(
            lambda name: '.meta' in name,
            files))
        if len(meta_files) != 1:
            abort(400, 'Wrong number of .meta files')

        data_files = list(filter(
            lambda name: '.ckpt.data' in name,
            files))
        if len(data_files) != 1:
            abort(400, 'Wrong number of .ckpt.data files')

        index_files = list(filter(
            lambda name: '.ckpt.index' in name,
            files))
        if len(index_files) != 1:
            abort(400, 'Wrong number of .ckpt.index files')

        return meta_files[0], data_files[0], index_files[0]

    def post(self):
        if 'file' not in request.files:
            abort(400, message='No file attached')

        postfile = request.files['file']
        if postfile.filename == '':
            abort(400, message='No file attached')

        postdata = request.form
        self.__verify_postdata(postdata)
        zipdata = ZipFile(postfile.stream)
        meta, data, index = self.__verify_zip(zipdata)

        new_arch = Architecture(
                name=postdata['arch_name'],
                description=postdata.get('arch_desc'),
                graph='{\"nodes\": [], \"links\": []}',
                user_id=get_current_user())
        try:
            new_arch.add()
        except Exception as e:
            abort(403, message=e)

        try:
            meta_path = os.path.join(
                    app.config['WEIGHTS_DIR'],
                    str(new_arch.id),
                    'graph.meta')
            with open(meta_path, 'wb') as fd:
                fd.write(zipdata.read(meta))
        except Exception as e:
            new_arch.delete()
            abort(403, message=e)

        new_model = Model(
                name=postdata['model_name'],
                description=postdata.get('model_desc'),
                weights_path='',
                arch_id=new_arch.id)
        try:
            new_model.add()
        except Exception as e:
            new_arch.delete()
            abort(403, message=e)

        try:
            os.mkdir(new_model.weights_path)
            data_path = os.path.join(
                    new_model.weights_path,
                    'model.ckpt.data-00000-of-00001')
            with open(data_path, 'wb') as fd:
                fd.write(zipdata.read(data))
            index_path = os.path.join(
                    new_model.weights_path,
                    'model.ckpt.index')
            with open(index_path, 'wb') as fd:
                fd.write(zipdata.read(index))
        except Exception as e:
            new_model.delete()
            new_arch.delete()
            abort(403, message=e)

        return {
                'arch': new_arch.to_dict(),
                'model': new_model.to_dict()
                }
