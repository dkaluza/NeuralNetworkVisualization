from flask import request
from flask_restful import abort, Resource

from app.nnvis.models import Architecture, Model
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


class ArchitectureTask(Resource):
    def __abort_if_arch_doesnt_exist(self, arch_id):
        if Architecture.query.get(arch_id) is None:
            message = 'Architecture {id} doesn\'t exist'.format(id=arch_id)
            abort(403, message=message)

    def get(self, arch_id):
        self.__abort_if_arch_doesnt_exist(arch_id)
        arch = Architecture.query.get(arch_id)
        return arch_to_dict(arch)

    def delete(self, arch_id):
        self.__abort_if_arch_doesnt_exist(arch_id)
        models = Model.query.filter_by(arch_id=arch_id).all()
        if len(models) > 0:
            message = 'Architecture {id} still has some models'\
                      .format(id=arch_id)
            abort(403, message=message)

        arch = Architecture.query.get(arch_id)
        arch.delete()
        return '', 204

    def post(self, arch_id):
        self.__abort_if_arch_doesnt_exist(arch_id)
        models = Model.query.filter_by(arch_id=arch_id).all()
        if len(models) > 0:
            message = 'Architecture {id} still has some models'\
                      .format(id=arch_id)
            abort(403, message=message)

        arch = Architecture.query.get(arch_id)

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


class UploadNewArchitecture(Resource):
    def post(self):
        args = request.get_json(force=True)
        new_arch = Architecture(name=args['name'],
                                description=args['description'],
                                graph=json.dumps(args['graph']))

        try:
            new_arch.add()
        except Exception as e:
            return abort(403, message=e.message)

        return arch_to_dict(new_arch), 201


class ListAllArchitectures(Resource):
    def get(self):
        archs = Architecture.query.all()
        return [arch_to_dict(arch) for arch in archs]
