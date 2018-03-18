from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user

from app.nnvis.models import Architecture, Model
from app.nnvis.rests.protected_resource import ProtectedResource
from datetime import datetime
import json


def arch_to_dict(arch):
    if arch.last_used is not None:
        last_used = arch.last_used.strftime('%Y-%m-%d')
    else:
        last_used = 'None'

    return {
            'id': arch.id,
            'name': arch.name,
            'description': arch.description,
            'architecture': json.loads(arch.graph),
            'last_used': last_used,
            'last_modified': arch.last_modified.strftime('%Y-%m-%d')
            }


class ArchitectureTask(ProtectedResource):
    def __abort_if_arch_doesnt_exist(self, arch, arch_id):
        if arch is None:
            message = 'Architecture {id} doesn\'t exist'.format(id=arch_id)
            abort(403, message=message)

    def __abort_if_arch_isnt_owned_by_user(self, arch):
        if arch.user_id != get_current_user():
            message = "Architecture {id} isn't owned by the user".format(
                id=arch.id)
            abort(401, message=message)

    def __abort_if_models_list_isnt_empty(self, models, arch_id):
        if len(models) > 0:
            message = 'Architecture {id} still has some models'\
                      .format(id=arch_id)
            abort(403, message=message)

    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self.__abort_if_arch_doesnt_exist(arch, arch_id)
        self.__abort_if_arch_isnt_owned_by_user(arch)
        return arch_to_dict(arch)

    def delete(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self.__abort_if_arch_doesnt_exist(arch, arch_id)
        self.__abort_if_arch_isnt_owned_by_user(arch)
        models = Model.query.filter_by(arch_id=arch_id).all()
        self.__abort_if_models_list_isnt_empty(models, arch_id)
        arch.delete()
        return '', 204

    def post(self, arch_id):
        arch = Architecture.query.get(arch_id)
        self.__abort_if_arch_doesnt_exist(arch, arch_id)
        self.__abort_if_arch_isnt_owned_by_user(arch)
        models = Model.query.filter_by(arch_id=arch_id).all()
        self.__abort_if_models_list_isnt_empty(models, arch_id)

        args = request.get_json(force=True)
        if 'name' in args:
            arch.name = args['name']
        if 'description' in args:
            arch.description = args['description']
        if 'graph' in args:
            arch.graph = json.dumps(args['graph'])
        arch.last_modified = datetime.utcnow()

        arch.update()
        return arch_to_dict(arch), 201


class UploadNewArchitecture(ProtectedResource):
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
            abort(403, message=e)

        return arch_to_dict(new_arch), 201


class ListAllArchitectures(ProtectedResource):
    def get(self):
        archs = Architecture.query.filter_by(user_id=get_current_user())
        return [arch_to_dict(arch) for arch in archs]
