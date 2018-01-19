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


class GetArchitecture(Resource):
    def get(self, arch_id):
        print(arch_id)
        mockup = [
            {
                'name': 'simple convolutions',
                'id': 1,
                'architecture': {
                    'nodes': [
                            {
                                'id': '1',
                                'label': 'input'
                            }, {
                                'id': '2',
                                'label': 'conv1'
                            }, {
                                'id': '3',
                                'label': 'conv2'
                            }, {
                                'id': '4',
                                'label': 'fc1'
                            }, {
                                'id': '5',
                                'label': 'fc2'
                            }
                        ],
                    'links': [
                            {
                                'source': '1',
                                'target': '2'
                            }, {
                                'source': '2',
                                'target': '3'
                            }, {
                                'source': '3',
                                'target': '4'
                            }, {
                                'source': '4',
                                'target': '5'
                            },
                        ],
                    }
            }, {
                'name': 'stupid',
                'id': 2,
                'architecture': {
                    'nodes': [
                        {
                            'id': '1',
                            'label': 'input1'
                        }, {
                            'id': '3',
                            'label': 'input2'
                        }, {
                            'id': '2',
                            'label': 'output'
                        }, {
                            'id': '4',
                            'label': 'alone'
                        }
                        ],
                    'links': [
                        {
                            'source': '1',
                            'target': '2',
                        }, {
                            'source': '3',
                            'target': '2',
                        }
                        ]
                    }
            }
        ]

        for arch in mockup:
            print(arch)
            if arch['id'] == arch_id:
                print('selected {}'.format(arch))
                return arch
        return {}


class ListAllArchitectures(Resource):
    def get(self):
        # TODO: REST /listarchs
        mockup = [
            {
                'name': 'simple convolutions',
                'id': 1
            }, {
                'name': 'stupid',
                'id': 2
            }
        ]

        return mockup


class ListAllModels(Resource):
    def get(self, arch_id):
        # TODO: REST /listmodels
        mockup = [
                {'name': 'model1', 'id': 1},
                {'name': 'model2', 'id': 2},
                {'name': 'model3', 'id': 3},
                {'name': 'model4', 'id': 4},
                {'name': 'model5', 'id': 5}
                ]
        return mockup


api.add_resource(Init, '')
api.add_resource(AddArchitecture, 'add')
api.add_resource(GetArchitecture, 'getarch/<int:arch_id>')
api.add_resource(ListAllArchitectures, 'listarchs')
api.add_resource(ListAllModels, 'listmodels/<int:arch_id>')
