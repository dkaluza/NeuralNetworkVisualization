from flask import Blueprint, make_response
from flask_restful import Api, Resource
from app.nnvis.models import Architecture

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


api.add_resource(Init, '')
api.add_resource(AddArchitecture, 'add')
