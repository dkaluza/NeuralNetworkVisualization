from flask_restful import abort
from flask_jwt_extended import get_current_user

from app.nnvis.models import session, Dataset, Model
from app.nnvis.rests.protected_resource import ProtectedResource


def dataset_to_dict(dataset):
    return {
        'id': dataset.id,
        'name': dataset.name,
        'description': dataset.description
    }


class DatasetTask(ProtectedResource):
    def __abort_if_dataset_doesnt_exist(self, dataset, dataset_id):
        if dataset is None:
            message = 'Dataset {id} doesn\'t exist' \
                      .format(id=dataset_id)
            abort(403, message=message)

    def __abort_if_dataset_isnt_owned_by_user(self, dataset):
        if dataset.user_id != get_current_user():
            message = "Dataset {id} isn't owned by the user".format(
                id=dataset.id)
            abort(401, message=message)

    def get(self, dataset_id):
        dataset = session.query(Dataset).get(dataset_id)
        self.__abort_if_dataset_doesnt_exist(dataset, dataset_id)
        self.__abort_if_dataset_isnt_owned_by_user(dataset)
        return dataset_to_dict(dataset)

    def delete(self, dataset_id):
        dataset = session.query(Dataset).get(dataset_id)
        self.__abort_if_dataset_doesnt_exist(dataset, dataset_id)
        self.__abort_if_dataset_isnt_owned_by_user(dataset)
        models = session.query(Model).filter_by(dataset_id=dataset_id).all()
        for model in models:
            model.dataset_id = None
            model.update()
        dataset.delete()
        return '', 204


class UploadNewDataset(ProtectedResource):
    def post(self):
        # TODO: upload_new_dataset REST
        pass


class ListAllDatasets(ProtectedResource):
    def get(self):
        datasets = session.query(Dataset).filter_by(user_id=get_current_user())
        return [dataset_to_dict(dataset)
                for dataset in datasets]
