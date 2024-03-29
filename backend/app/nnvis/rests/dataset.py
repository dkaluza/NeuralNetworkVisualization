from flask import request
from flask_restful import abort
from flask_jwt_extended import get_current_user
from flask import current_app as app

from app import db
from app.nnvis.models import Dataset, Model, Image
from app.nnvis.models import Trainingsample as TrainingSample
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


class DatasetBuilder(object):
    """Creates the Image and TrainingSample entries associated with a dataset"""

    def __init__(self, dataset_id, path):
        self._dataset_id = dataset_id
        self._path = path

        self._label_list = self._parse_class_mapping(path)
        self._img_to_label, self._img_to_ts, self._img_to_position, self._imgs_per_sample, self._ts_to_name, ts_no =\
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
        labelsmapdf = pd.read_csv(os.path.join(path, app.config['LABELS_FILENAME']))
        lcols = labelsmapdf.columns
        _assert(len(lcols) > 2, "labels file is required to have at least 3 columns")

        labelsmapdf[lcols[-2]] = labelsmapdf[lcols[-2]].astype(np.int32)
        labelsmap_vals = labelsmapdf[lcols[-2]].values
        DatasetBuilder._assert_labels_in_range(labelsmap_vals, class_no)

        labeldicts = [pd.Series(labelsmap_vals, index=labelsmapdf[col]).to_dict() for col in lcols[:-2]]
        row_no = len(labelsmapdf.index)
        tsdicts = [pd.Series(np.arange(row_no), index=labelsmapdf[col]).to_dict() for col in lcols[:-2]]
        positiondicts = [pd.Series(np.repeat(i, row_no), index=labelsmapdf[col]).to_dict() for i, col in enumerate(lcols[:-2])]
        tsname_dict = pd.Series(labelsmapdf[lcols[-1]], index=np.arange(row_no)).to_dict()

        labelsdict_sum = reduce(lambda x, y: {**x, **y}, labeldicts)
        tsdict_sum = reduce(lambda x, y: {**x, **y}, tsdicts)
        positiondict_sum = reduce(lambda x, y: {**x, **y}, positiondicts)
        return labelsdict_sum, tsdict_sum, positiondict_sum, (len(lcols) - 2), tsname_dict, row_no

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
        existing_ts = self.training_samples[ts_no]
        ts_name = self._ts_to_name[ts_no]

        if not existing_ts:
            label = str(self._img_to_label[fname])
            self.training_samples[ts_no] = TrainingSample(
                name=str(ts_name),
                label=label,
                dataset_id=self._dataset_id
            )

    def _create_image(self, fname):
        pos = self._img_to_position[fname]
        new_image = Image(imageName=fname.rsplit('.', 1)[0],
                          relPath=fname,
                          trainsample_id=1,
                          trainsample_position=pos)
        
        self.imgs.append(new_image)
    
    def build(self):
        db.session.add_all(self.training_samples)
        db.session.flush()
        self._update_ts_ids()
        db.session.bulk_save_objects(self.imgs)
        db.session.commit()

    def _update_ts_ids(self):
        for img in self.imgs:
            ts_no = self._img_to_ts[img.relative_path]
            ts = self.training_samples[ts_no]
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
