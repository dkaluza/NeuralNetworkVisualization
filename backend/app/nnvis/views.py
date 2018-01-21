from flask import Blueprint, make_response
from flask_restful import Api, Resource
from app.nnvis.models import Architecture

from app.nnvis.models import Image

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


# /visualize/<string:algorithm>/<string:image_id>
class Images(Resource):
    def get(self, algorithm, image_id):
        if algorithm == 'GBP':
            EXAMPLE_LIST = [['img1.jpg', 56],
                            ['img2.jpg', 243],
                            ['img3.jpg', 72]]

            img_name, class_number = EXAMPLE_LIST[int(image_id)]
            img_proc_name, ext = img_name.rsplit('.')
            img_proc_name += '_GBP.jpg'

            # compute here

            prefix = 'http://localhost:5000/static/'
            img_path = prefix + 'original/' + img_name
            img_proc_path = prefix + 'GBP/' + img_proc_name

            image1 = Image(img_name, img_path)
            image2 = Image(img_proc_name, img_proc_path)
            return {'images': [image1.json(),
                               image2.json()]}

        return {'error message': algorithm + ' alogrithm is not handled yet'}, 202



api.add_resource(Init, '')
api.add_resource(AddArchitecture, 'add')
api.add_resource(ListAllArchitectures, 'listarchs')
api.add_resource(ListAllModels, 'listmodels/<string:arch_id>')
api.add_resource(Images, 'visualize/<string:algorithm>/<string:image_id>')
