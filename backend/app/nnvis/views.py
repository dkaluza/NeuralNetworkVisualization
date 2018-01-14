from flask import Blueprint, make_response
from flask_restful import Api, Resource
from app.nnvis.models import Architecture

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
    def get(self):
        arch = Architecture('Best arch', 'Great arch!!!',
                            'this is path to arch')
        arch.add(arch)
        return 'udało się <3'


class ListAllArchitectures(Resource):
    def get(self):
        # TODO: REST /listarchs
        mockup = [
                {"name": "simple convolutions", "id": 1},
                {"name": "basic resnet", "id": 2},
                {"name": "fancy resnet", "id": 3},
                ]

        return mockup


class ListAllModels(Resource):
    def get(self, arch_id):
        # TODO: REST /listmodels
        mockup = [
                {"name": "model1", "id": 1},
                {"name": "model2", "id": 2},
                {"name": "model3", "id": 3},
                {"name": "model4", "id": 4},
                {"name": "model5", "id": 5}
                ]
        return mockup


api.add_resource(Init, '')
api.add_resource(AddArchitecture, 'add')
api.add_resource(ListAllArchitectures, 'listarchs')
api.add_resource(ListAllModels, 'listmodels/<string:arch_id>')
