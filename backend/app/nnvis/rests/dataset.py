from flask_restful import abort, Resource

from app.nnvis.models import Dataset, Model


def dataset_to_dict(dataset):
    return {
            'id': dataset.id,
            'name': dataset.name,
            'description': dataset.description
            }


class DatasetTask(Resource):
    def __abort_if_dataset_doesnt_exist(dataset_id):
        if Dataset.query.get(dataset_id) is None:
            message = 'Dataset {id} doesn\'t exist' \
                      .format(id=dataset_id)
            abort(404, message=message)

    def get(self, dataset_id):
        self.__abort_if_dataset_doesnt_exist(dataset_id)
        dataset = Dataset.query.get(dataset_id)
        return dataset_to_dict(dataset)

    def delete(self, dataset_id):
        self.__abort_if_dataset_doesnt_exist(dataset_id)
        models = Model.query.filter_by(dataset_id=dataset_id).all()
        if len(models) > 0:
            message = 'Dataset {id} still has some models' \
                      .format(id=dataset_id)
            abort(404, message=message)
        dataset = Dataset.query.get(dataset_id)
        dataset.delete()
        return '', 204


class UploadNewDataset(Resource):
    def post(self):
        # TODO: upload_new_dataset REST
        pass


class ListAllDatasets(Resource):
    def get(self):
        datasets = Dataset.query.all()
        return [dataset_to_dict(dataset)
                for dataset in datasets]
