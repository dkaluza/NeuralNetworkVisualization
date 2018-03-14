from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Image
from app.nnvis.models import Model

from app.vis_tools.utils import algorithms_register
from app.vis_tools.utils import visualize_saliency
from app.vis_tools.utils import inference
from app.vis_tools.utils import NumpyEncoder

import json

class Inference(ProtectedResource):
    def get(self, model_id, image_id):
        model = Model.query.get(model_id)
        arch = model.arch_id
        image_path = Image.query.get(image_id).path

        # TODO: get tensorflow graph/weights from above db entries
        graph, weights = convert_tf(arch, model)
        prediction = inference(graph, weights, image_path)
        
        # TODO: convert int class to class name?

        return {'class': prediction}


class Visualize(ProtectedResource):
    def get(self, model_id, alg_id, image_id):
        model = Model.query.get(model_id)
        arch = model.arch_id
        image_path = Image.query.get(image_id).path

        # TODO: get tensorflow graph/weights from above db entries
        graph, weights = convert_tf(arch, model)

        saliency_img = visualize_saliency(graph, weights, alg_id, image_path)

        return json.dumps({'result_image': saliency_img}, cls=NumpyEncoder)


# /visualize/<string:algorithm>/<string:image_id>
class Images(ProtectedResource):
    def get(self, algorithm, image_id):
        print('in get images')
        if algorithm == 'GBP':
            EXAMPLE_LIST = [['img1.jpg', 56],
                            ['img2.jpg', 243],
                            ['img3.jpg', 72]]

            img_name, class_number = EXAMPLE_LIST[int(image_id)]
            img_proc_name, ext = img_name.rsplit('.')
            img_proc_name += '_GBP.jpg'

            # compute here

            prefix = 'api/static/'
            img_path = prefix + 'original/' + img_name
            img_proc_path = prefix + 'GBP/' + img_proc_name

            image1 = Image(img_name, img_path)
            image2 = Image(img_proc_name, img_proc_path)
            print('returning  images')
            return {'images': [image1.json(),
                               image2.json()]}

        print('returning error')
        return {'error message': algorithm + ' algorithm is not handled yet'}, 202

class Algorithms(ProtectedResource):

    def get(self):
        return {alg_class.__name__: alg_id for alg_id, alg_class in algorithms_register}
