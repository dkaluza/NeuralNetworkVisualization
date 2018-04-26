from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user
from flask import current_app as app

from app import db
from app.nnvis.models import Dataset, Model, Image, TrainingSample
from app.nnvis.rests.protected_resource import ProtectedResource
from app.utils import NnvisException

import os
import shutil
import pandas as pd
import numpy as np
from functools import reduce
from zipfile import ZipFile

SUPPORTED_EXTENSIONS = [
    'jpg',
    'JPG',
    'jpeg',
    'JPEG',
    'png',
    'PNG'
]


class TrainingSampleBuilder(object):

    def __init__(self, name, label, dataset_id):
        self.name = name
        self.label = label
        self.dataset_id = dataset_id

    def add_img(self):
        return self

    def build(self):
        return TrainingSample(
            name=self.name,
            label=self.label,
            dataset_id=self.dataset_id
        )


class DatasetBuilder(object):
    """Creates the Image and TrainingSample entries associated with a dataset"""

    def __init__(self, dataset_id, path):
        self._dataset_id = dataset_id
        self._path = path

        self._label_list = self._parse_class_mapping(path)
        self._img_to_label, self._img_to_ts, self._imgs_per_sample, ts_no =\
            self._parse_labels_mapping(path, len(self._label_list))

        self.imgs = []
        self.training_samples = [None] * ts_no

    @staticmethod
    def _parse_class_mapping(path):
        classmap_filename = app.config['CLASSMAP_FILENAME']
        classmapdf = pd.read_csv(os.path.join(path, classmap_filename))
        ccols = classmapdf.columns
        classmapdf[ccols[0]] = classmapdf[ccols[0]].astype(np.int32)
        classnums = sorted(classmapdf[ccols[0]].tolist())
        DatasetBuilder._assert_labels_are_consecutive_numbers(classnums)

        label_list = classmapdf.sort_values([ccols[0]])[ccols[1]].tolist()
        return label_list

    @staticmethod
    def _parse_labels_mapping(path, class_no):
        labels_filename = app.config['LABELS_FILENAME']
        labelsmapdf = pd.read_csv(os.path.join(path, labels_filename))
        lcols = labelsmapdf.columns
        labelsmapdf[lcols[-1]] = labelsmapdf[lcols[-1]].astype(np.int32)
        labelsmap_vals = labelsmapdf[lcols[-1]].values
        DatasetBuilder._assert_labels_in_range(labelsmap_vals, class_no)

        labeldicts = [pd.Series(labelsmap_vals, index=labelsmapdf[col]).to_dict() for col in lcols[:-1]]
        row_no = labelsmapdf.count()
        tsdicts = [pd.Series(np.arange(row_no), index=labelsmapdf[col]).to_dict() for col in lcols[:-1]]

        labelsdict_sum = reduce(lambda x, y: {**x, **y}, labeldicts)
        tsdict_sum = reduce(lambda x, y: {**x, **y}, tsdicts)
        return labelsdict_sum, tsdict_sum, (len(lcols) - 1), row_no

    @staticmethod
    def _assert_labels_are_consecutive_numbers(array):
        for i, classnum in enumerate(array):
            _assert(classnum == i, "Class numbers must be a consecutive numbers starting from 0")

    @staticmethod
    def _assert_labels_in_range(array, class_no):
        for classnum in array:
            _assert(classnum < class_no, "Data point has a class number without a corresponding name mapping")

    def label_list(self):
        return self._label_list

    def imgs_per_sample(self):
        return self._imgs_per_sample

    def process_file(self, fname):
        if self._check_supported_extension(fname):
            self._create_trainingsample(fname)
            self._create_image(fname)
        else:
            labels_filename = app.config['LABELS_FILENAME']
            classmap_filename = app.config['CLASSMAP_FILENAME']
            _assert(fname == labels_filename or fname == classmap_filename, 'Unexpected file found in archive')

    @staticmethod
    def _check_supported_extension(fname):
        return fname.rsplit('.', 1)[1] in SUPPORTED_EXTENSIONS

    def _create_trainingsample(self, fname):
        ts_no = self._img_to_ts[fname]
        existing_ts = self._training_samples[ts_no]

        if not existing_ts:
            label = str(self._img_to_label[fname])
            self.training_samples[ts_no] = TrainingSample(
                name='Training sample {}'.format(ts_no),
                label=label,
                dataset_id=self._dataset_id
            )

    def _create_image(self, fname, ts_id):
        new_image = Image(imageName=fname.rsplit('.', 1)[0],
                          relPath=fname,
                          trainingsample_id='To be inserted')
        
        self.imgs.append(new_image)
    
    def build(self):
        db.session.bulk_save_objects(self.training_samples)
        db.session.flush()
        self._update_ts_ids()
        db.session.bulk_save_objects(self.imgs)
        db.session.commit()

    def _update_ts_ids(self):
        for img in self.imgs:
            ts_no = self._img_to_ts[img.relative_path]
            ts = self.training_samples[ts_no]
            db.session.refresh(ts)
            img.trainsample_id = ts.id


def dataset_to_dict(dataset):
    return {
        'id': dataset.id,
        'name': dataset.name,
        'description': dataset.description
    }


def _assert(b, msg):
    if not b:
        raise NnvisException(msg)


def unzip_validate_archive(path, file, dataset_id):
    try:
        os.makedirs(path, exist_ok=True)
        archive = ZipFile(file)
        archive.extractall(path)

        ds_builder = DatasetBuilder(dataset_id, path)

        for entry in os.scandir(path):
            _assert(entry.is_file(), "Unexpected directory found in archive")
            ds_builder.process_file(entry.name)

        ds_builder.build()

        return ds_builder.label_list(), ds_builder.imgs_per_sample()

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

    def post(self):
        if 'file' not in request.files:
            self.__abort_400('No dataset file attached')

        postfile = request.files['file']
        if postfile.filename == '':
            self.__abort_400('No dataset file selected')

        postdata = request.form
        self.__verify_postdata(postdata)

        new_dataset = Dataset(name=postdata['name'],
                              # None if isn't given, TODO: check this works
                              description=postdata.get('description'),
                              path='',
                              labels='',
                              imgs_per_sample=0,
                              user_id=get_current_user())

        try:
            new_dataset.add()
            new_dataset.path = os.path.join(app.config['DATASET_FOLDER'],
                                            str(new_dataset.id))
            unique_labels, imgs_per_sample = unzip_validate_archive(
                                new_dataset.path,
                                postfile.stream,
                                new_dataset.id)
            new_dataset.labels = ','.join(map(str, unique_labels))
            new_dataset.imgs_per_sample = imgs_per_sample
            new_dataset.update()
        except:
            new_dataset.delete()
            raise

        return '', 201


class ListAllDatasets(ProtectedResource):
    def get(self):
        datasets = Dataset.query.filter_by(user_id=get_current_user())
        return [dataset_to_dict(dataset)
                for dataset in datasets]
