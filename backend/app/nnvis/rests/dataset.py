from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user
from flask import current_app as app

from app.nnvis.models import db, Dataset, Model, Image
from app.nnvis.rests.protected_resource import ProtectedResource
from app.utils import NnvisException

import os
import shutil
import pandas as pd
from zipfile import ZipFile

SUPPORTED_EXTENSIONS = [
    'jpg',
    'png'
]


def dataset_to_dict(dataset):
    return {
        'id': dataset.id,
        'name': dataset.name,
        'description': dataset.description
    }


def _assert(b, msg):
    if not b:
        raise NnvisException(msg)


def check_supported_extension(fname):
    return fname.rsplit('.', 1)[1] in SUPPORTED_EXTENSIONS


def create_image(fname, labelsdict, dataset_id):
    _assert(check_supported_extension(fname), "Unsupported extension found")
    new_image = Image(imageName=fname.rsplit('.', 1)[0],
                      relPath=fname,
                      label=labelsdict[fname],
                      dataset_id=dataset_id)
    return new_image


# TODO: Label validation against labels passed to db
def unzip_validate_archive(path, file, dataset_id):
    labels_filename = app.config['LABELS_FILENAME']

    try:
        os.makedirs(path, exist_ok=True)
        archive = ZipFile(file)
        archive.extractall(path)

        labelsdf = pd.read_csv(os.path.join(path, labels_filename))
        cols = labelsdf.columns
        labelsdict = pd.Series(labelsdf[cols[1]].values,
                               index=labelsdf[cols[0]]).to_dict()

        images = []

        for entry in os.scandir(path):
            _assert(entry.is_file(), "Unexpected directory found in archive")
            if check_supported_extension(entry.name):
                image = create_image(entry.name, labelsdict, dataset_id)
                images.append(image)
            elif entry.name != labels_filename:
                raise NnvisException('Unexpected file found in archive')

        db.session.bulk_save_objects(images)
        db.session.commit()

    except:
        shutil.rmtree(path, ignore_errors=True)
        raise


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
        dataset = Dataset.query.get(dataset_id)
        self.__abort_if_dataset_doesnt_exist(dataset, dataset_id)
        self.__abort_if_dataset_isnt_owned_by_user(dataset)
        return dataset_to_dict(dataset)

    def delete(self, dataset_id):
        dataset = Dataset.query.get(dataset_id)
        self.__abort_if_dataset_doesnt_exist(dataset, dataset_id)
        self.__abort_if_dataset_isnt_owned_by_user(dataset)
        models = Model.query.filter_by(dataset_id=dataset_id).all()
        for model in models:
            model.dataset_id = None
            model.update()

        shutil.rmtree(dataset.path, ignore_errors=True)
        dataset.delete()
        return '', 204


class UploadNewDataset(ProtectedResource):
    def __abort_400(self, msg):
        abort(400, message=msg)

    def __verify_postdata(self, postdata):
        if 'name' not in postdata:
            self.__abort_400('Name for new dataset required')
        if 'labels' not in postdata:
            self.__abort_400('Labels for new dataset required')

        # TODO: verify labels format, probably something like
        #   "[class1, class2, ...]" using a Regex or something

    def post(self):
        if 'file' not in request.files:
            self.__abort_400('No dataset file attached')

        postfile = request.files['file']
        if postfile.filename == '':
            self.__abort_400('No dataset file selected')

        postdata = request.form
        self.__verify_postdata(postdata)

        dataset_path = os.path.join(app.config['DATASET_FOLDER'],
                                    postdata['name'])
        new_dataset = Dataset(name=postdata['name'],
                              description=postdata.get('description'),  # None if isn't given, TODO: check this works
                              path=dataset_path,
                              labels=postdata['labels'],
                              user_id=get_current_user())

        try:
            new_dataset.add()
            unzip_validate_archive(dataset_path, postfile.stream,
                                   new_dataset.id)
        except Exception as e:
            new_dataset.delete()
            abort(500, message=str(e))

        return '', 201


class ListAllDatasets(ProtectedResource):
    def get(self):
        datasets = Dataset.query.filter_by(user_id=get_current_user())
        return [dataset_to_dict(dataset)
                for dataset in datasets]
