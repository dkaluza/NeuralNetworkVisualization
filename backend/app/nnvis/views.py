from flask import Blueprint, make_response, request
from flask_restful import reqparse, Api, Resource
from app.nnvis.models import db, Architecture, Model

import json

nnvis = Blueprint('nnvis', __name__)
api = Api(nnvis)


class Init(Resource):
    def get(self):
        html = '<!DOCTYPE html> <html> <body> Hello ZPP! \
                {arch} </body> </html>'
        if len(Architecture.query.all()) == 0:
            html = html.format(arch='')
        else:
            html = html.format(arch=Architecture.query.all()[0].name)
        headers = {'Content-Type': 'text/html'}
        return make_response(html, 200, headers)


class AddArchitecture(Resource):
    def post(self):
        args = request.get_json(force=True)
        new_arch = Architecture(name=args['name'],
                                description=args['description'],
                                graph=json.dumps(args['graph']))

        db.session.add(new_arch)
        try:
            db.session.commit()
        except:
            return {'message': 'Error during adding into DB'}, 500

        return {'message': 'OK'}, 200


class GetArchitecture(Resource):
    def get(self, arch_id):
        arch = Architecture.query.get(arch_id)

        if arch is None:
            return {'message': 'There is no architecture with this id'}, 400

        graph = json.loads(arch.graph)
        return {
                'name': arch.name,
                'id': arch.id,
                'architecture': graph
                }


class ListAllArchitectures(Resource):
    def get(self):
        archs = Architecture.query.all()
        return [{
            'name': arch.name,
            'id': arch.id,
            'architecture': json.loads(arch.graph)
            } for arch in archs]


class ListAllModels(Resource):
    def get(self, arch_id):
        models = Model.query.filter_by(arch_id=arch_id)
        return [{
            'id': model.id,
            'name': model.id
            } for model in models]


api.add_resource(Init, '')
api.add_resource(AddArchitecture, 'add')
api.add_resource(GetArchitecture, 'getarch/<int:arch_id>')
api.add_resource(ListAllArchitectures, 'listarchs')
api.add_resource(ListAllModels, 'listmodels/<int:arch_id>')
