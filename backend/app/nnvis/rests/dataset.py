from flask_restful import abort, Resource

from app.nnvis.models import session, Dataset, Model


def dataset_to_dict(dataset):
    return {
            'id': dataset.id,
            'name': dataset.name,
            'description': dataset.description
            }


class DatasetTask(Resource):
    def __abort_if_dataset_doesnt_exist(self, dataset_id):
        if session.query(Dataset).get(dataset_id) is None:
            message = 'Dataset {id} doesn\'t exist' \
                      .format(id=dataset_id)
            abort(403, message=message)

    def get(self, dataset_id):
        self.__abort_if_dataset_doesnt_exist(dataset_id)
        dataset = session.query(Dataset).get(dataset_id)
        return dataset_to_dict(dataset)

    def delete(self, dataset_id):
        self.__abort_if_dataset_doesnt_exist(dataset_id)
        models = session.query(Model).filter_by(dataset_id=dataset_id).all()
        for model in models:
            model.dataset_id = None
            model.update()
        dataset = session.query(Dataset).get(dataset_id)
        dataset.delete()
        return '', 204


class UploadNewDataset(Resource):
    def post(self):
        # TODO: upload_new_dataset REST
        pass


class ListAllDatasets(Resource):
    def get(self):
        datasets = session.query(Dataset).all()
        return [dataset_to_dict(dataset)
                for dataset in datasets]
