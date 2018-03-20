from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user

from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Dataset, Architecture, Model
from app.nnvis.train.train import TrainThread


ARGS_LIST = [
        'dataset_id',
        'loss',
        'optimizer',
        'nepochs',
        'batch_size',
        'optimizer_params'
        ]


class TrainNewModel(ProtectedResource):

    def post(self, arch_id):
        arch = Architecture.query \
                .filter_by(user_id=get_current_user(), id=arch_id)
        if arch is None:
            abort(403, message='This Architecture doesn\'t exists')

        args = request.get_json(force=True)
        if 'name' not in args:
            abort(403, message='No name provided')

        for name in ARGS_LIST:
            if name not in args:
                abort(403, message='No {} selected'.format(name))

        name = args['name']
        desc = args.get('description')
        dataset_id = args['dataset_id']
        if Dataset.query.filter_by(
                user_id=get_current_user(), id=dataset_id) is None:
            abort(403, message='Selected dataset doesn\'t exists')

        if len(Model.query.filter_by(arch_id=arch_id, name=name).all()) > 0:
            abort(403, message='Model with this name already exists')
        model = Model(name=name, description=desc, weights_path='',
                      arch_id=arch_id, dataset_id=dataset_id)
        model.add()
        try:
            optparams = {}
            for k, v in args['optimizer_params'].items():
                optparams[k] = float(v)

            params = {
                    'nepochs': int(args['nepochs']),
                    'batch_size': int(args['batch_size']),
                    'loss': args['loss'],
                    'optimizer': args['optimizer'],
                    'optimizer_params': optparams
                    }
            thread1 = TrainThread(model.arch_id, model.id,
                                  model.dataset_id, params)
            thread1.start()
        except Exception as e:
            print('Unable to start thread: {}'.format(e))
            abort(500, message=e)

        return {'message': 'Training started succesfully'}, 200


class TrainModel(ProtectedResource):
    def get(self, model_id):
        # TODO: train_model REST
        pass
