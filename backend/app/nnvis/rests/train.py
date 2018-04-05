from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user

from app.nnvis.rests.protected_resource import ProtectedResource
from app.nnvis.models import Dataset, Architecture, Model, TrainingHistory
from app.nnvis.train.train import TrainThread

from app.nnvis.train.losses import LOSSES_LIST
from app.nnvis.train.optimizers import OPTIMIZERS_LIST


ARGS_LIST = [
    'dataset_id',
    'loss',
    'optimizer',
    'nepochs',
    'batch_size',
    'optimizer_params'
]


def training_history_to_dict(history):

    return {
        'id': history.id,
        'model_name': history.model.name,
        'arch_name': history.model.architecture.name,
        'valid_loss': history.validation_loss,
        'train_loss': history.training_loss,
        'batch_size': history.batch_size,
        'number_of_epochs': history.number_of_epochs
    }


class CurrentlyTrainedModels(ProtectedResource):
    def get(self):
        trainedModels = TrainingHistory.query \
            .filter(TrainingHistory.model.user_id == get_current_user(),
                    TrainingHistory.current_epoch != TrainingHistory.number_of_epochs)
        return [training_history_to_dict(history) for history in trainedModels], 200


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
            for param in args['optimizer']['params']:
                optparams[param['id']] = float(param['value'])

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


class ListLosses(ProtectedResource):
    def get(self):
        return LOSSES_LIST


class ListOptimizers(ProtectedResource):
    def get(self):
        return OPTIMIZERS_LIST
