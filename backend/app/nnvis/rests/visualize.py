from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Image


class Inference(ProtectedResource):
    def get(self, model_id):
        # TODO: inference REST
        pass


class Visualize(ProtectedResource):
    def get(self, model_id, alg_id):
        # TODO: visualize REST
        pass


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
        return {'error message': algorithm + ' alogrithm is not handled yet'}, 202
