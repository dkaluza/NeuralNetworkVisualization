from flask import request
from flask_restful import abort, Resource

from app.nnvis.models import session, Architecture, Model
from app.nnvis.build_model import TrainThread
from app.nnvis.rests.protected_resource import ProtectedResource


class TrainNewModel(ProtectedResource):
    def post(self, arch_id, dataset_id):
        arch = session.query(Architecture).get(arch_id)
        if arch is None:
            abort(403, message='This Architecture doesn\'t exists')

        args = request.get_json(force=True)
        name = args['name']
        desc = args['description']

        if len(session.query(Model).
                filter_by(arch_id=arch_id, name=name).all()) > 0:
            abort(403, message='Model with this name already exists')
        model = Model(name=name, description=desc, weights_path='',
                      arch_id=arch_id, dataset_id=dataset_id)
        model.add()
        try:
            params = {
                    'nepochs': int(args['nepochs']),
                    'batch_size': int(args['batch_size']),
                    'learning_rate': float(args['learning_rate'])
                    }
            thread1 = TrainThread(model.arch_id, model.id,
                                  model.dataset_id, params)
            thread1.start()
            # thread1.join()
        except Exception as e:
            print('Unable to start thread: {}'.format(e))
            abort(500, message=e)

        return {'message': 'Training started succesfully'}, 200


class TrainModel(ProtectedResource):
    def get(self, model_id, dataset_id):
        # TODO: train_model REST
        pass
