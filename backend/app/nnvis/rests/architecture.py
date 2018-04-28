from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user

from datetime import datetime
import json
import os

from app.utils import fileToB64
from app.nnvis.models import Architecture, Model
from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.train.build_model import TFModel

from app.nnvis.graph_parse.parse import GraphParser, IncorrectMetaGraph

class ArchitectureUtils(object):
    @staticmethod
    def _save_meta_file(arch):
        graph = json.loads(arch.graph)
        tfmodel = TFModel(graph['nodes'], graph['links'])
        tfmodel.save_graph(arch.get_folder_path())

    @staticmethod
    def _abort_if_arch_doesnt_exist(arch, arch_id):
        if arch is None:
            message = 'Architecture {id} doesn\'t exist'.format(id=arch_id)
            abort(403, message=message)

    @staticmethod
    def _abort_if_arch_isnt_owned_by_user(arch):
        if arch.user_id != get_current_user():
            message = "Architecture {id} isn't owned by the user".format(
                id=arch.id)
            abort(401, message=message)

    @staticmethod
    def _abort_if_models_list_isnt_empty(models, arch_id):
        if len(models) > 0:
            message = 'Architecture {id} still has some models'\
                      .format(id=arch_id)
            abort(403, message=message)


class ArchitectureTask(ProtectedResource, ArchitectureUtils):
    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self._abort_if_arch_doesnt_exist(arch, arch_id)
        self._abort_if_arch_isnt_owned_by_user(arch)
        return arch.to_dict()

    def delete(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self._abort_if_arch_doesnt_exist(arch, arch_id)
        self._abort_if_arch_isnt_owned_by_user(arch)
        models = Model.query.filter_by(arch_id=arch_id).all()
        self._abort_if_models_list_isnt_empty(models, arch_id)
        arch.delete()
        return '', 204

    def post(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self._abort_if_arch_doesnt_exist(arch, arch_id)
        self._abort_if_arch_isnt_owned_by_user(arch)
        models = Model.query.filter_by(arch_id=arch_id).all()
        self._abort_if_models_list_isnt_empty(models, arch_id)

        args = request.get_json(force=True)
        if 'name' in args:
            arch.name = args['name']
        if 'description' in args:
            arch.description = args['description']
        if 'graph' in args:
            arch.graph = json.dumps(args['graph'])
            self._save_meta_file(arch)

        arch.last_modified = datetime.utcnow()

        arch.update()
        return arch.to_dict(), 201


class UploadNewArchitecture(ProtectedResource, ArchitectureUtils):
    def post(self):
        user_id = get_current_user()
        args = request.get_json(force=True)

        if 'name' not in args:
            abort(404, message='No architecure name provided')
        if 'graph' not in args:
            abort(404, message='No graph provided')
        if 'description' not in args:
            args['description'] = None

        new_arch = Architecture(name=args['name'],
                                description=args['description'],
                                graph=json.dumps(args['graph']),
                                user_id=user_id)

        try:
            new_arch.add()
        except Exception as e:
            print(e)
            abort(403, message=e)

        try:
            self._save_meta_file(new_arch)
        except Exception as e:
            print(e)
            new_arch.delete()
            abort(403, message=str(e))

        return new_arch.to_dict(), 201


class ListAllArchitectures(ProtectedResource, ArchitectureUtils):
    def get(self):
        archs = Architecture.query.filter_by(user_id=get_current_user())
        return [arch.to_dict() for arch in archs]


class ImportArchitecture(ProtectedResource):
    def __verify_postdata(self, data):
        if 'name' not in data:
            abort(400, 'Name is required')

    def post(self):
        if 'file' not in request.files:
            abort(400, message='No file attached')

        postfile = request.files['file']
        if postfile.filename == '':
            abort(400, message='No file attached')

        postdata = request.form
        self.__verify_postdata(postdata)

        new_arch = Architecture(
                name=postdata['name'],
                description=postdata.get('desc'),
                graph='{\"nodes\": [], \"links\": []}',
                user_id=get_current_user())
        try:
            new_arch.add()
        except Exception as e:
            abort(403, message=e)

        try:
            path = new_arch.get_meta_file_path()
            with open(path, 'wb') as fd:
                fd.write(postfile.stream.read())
            parser = GraphParser(path)
            graph = parser.parse()
            new_arch.graph = json.dumps(graph)
            new_arch.update()
        except Exception as e:
            new_arch.delete()
            abort(403, message=e)

        return new_arch.to_dict(), 201


class ExportArchitecture(ProtectedResource, ArchitectureUtils):
    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self._abort_if_arch_doesnt_exist(arch, arch_id)
        self._abort_if_arch_isnt_owned_by_user(arch)

        graph_path = os.path.join(arch.get_folder_path(), 'graph.meta')
        with open(graph_path, 'rb') as graph_fd:
            graph_b64 = fileToB64(graph_fd)

        filename = '{name}.meta'.format(
                name=arch.name.replace(' ', '_')
                )
        return {
                'base64': [{
                    'name': 'file',
                    'contentType': 'application/octet-stream'
                    }],
                'filename': filename,
                'file': graph_b64
                }
