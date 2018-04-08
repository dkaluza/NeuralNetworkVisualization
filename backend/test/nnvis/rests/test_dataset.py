from test import NNvisTestCase
from test.utils import response_json, authorized_post
from test_config import LABELS_FILENAME

from app.nnvis.models import Dataset, Image

import zipfile
import csv
import os
from io import BytesIO, StringIO


def create_labels(colnames, *rows):
    labelfile = StringIO()
    labelfilewriter = csv.writer(labelfile, delimiter=',')
    labelfilewriter.writerow(colnames)

    for r in rows:
        labelfilewriter.writerow(r)

    return labelfile.getvalue()


def bad_zipfile():
    return (BytesIO(b'test'), 'bad.zip')


def good_zipfile_noimgs():
    retfile = BytesIO()
    labelfilestr = create_labels(['image', 'label'])

    with zipfile.ZipFile(retfile, mode="x", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)

    retfile.seek(0)
    return (retfile, 'noimg.zip')


def good_zipfile_imgs():
    retfile = BytesIO()
    labelfilestr = create_labels(
        ['image', 'label'],
        ['01.jpg', 'class1'],
        ['02.jpg', 'class2'],
        ['69.jpg', 'class1']
    )

    with zipfile.ZipFile(retfile, mode="w", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)
        thezip.writestr('01.jpg', 'eeeeeagbdfvdfdgfbdafd')
        thezip.writestr('02.jpg', 'raboerijbaoeribriribv')
        thezip.writestr('69.jpg', 'bcvnxm,zxzxnbnnnneeef')

    retfile.seek(0)
    return (retfile, 'imgs.zip')

DATASET_NAME = 'testname'
DATASET_LABELS = ['class1', 'class2']
DATASET_DESCRIPTION = 'testdesc'


class UploadNewDatasetTest(NNvisTestCase):

    def test_nofile(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            description=DATASET_DESCRIPTION
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'No dataset file attached')

    def test_noname(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            description=DATASET_DESCRIPTION,
            file=bad_zipfile()
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'Name for new dataset required')

    def test_bad_zipfile(self):
        with self.assertRaises(zipfile.BadZipfile):
            _ = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
                name=DATASET_NAME,
                description=DATASET_DESCRIPTION,
                file=bad_zipfile()
            ), mimetype='multipart/form-data')

    def test_zipfile_noimgs(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            description=DATASET_DESCRIPTION,
            file=good_zipfile_noimgs()
        ), mimetype='multipart/form-data')

        self.assertEqual(rv.status_code, 201)
        ds_id = self._assertDatasetCreated(labels=False)
        self.assertEqual(len(Image.query.all()), 0)

        dataset_folder = os.path.join(test_app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 1)
        self.assertEqual(dataset_files[0], LABELS_FILENAME)

        with open(os.path.join(dataset_folder, LABELS_FILENAME), mode='r', newline='') as csvf:
            labelsreader = csv.reader(csvf, delimiter=',')
            rows = list(labelsreader)
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0], ['image', 'label'])

    def _assertDatasetCreated(self, labels=True):
        datasets = Dataset.query.all()
        self.assertEqual(len(datasets), 1)
        ds = datasets[0]
        self.assertEqual(ds.name, DATASET_NAME)
        if labels:
            self.assertEqual(ds.labels.split(','), DATASET_LABELS)
        self.assertEqual(ds.description, DATASET_DESCRIPTION)

        return ds.id

    def _assertImagesCreated(self):
        images = Image.query.all()
        ds_id = Dataset.query.all()[0].id
        self.assertEqual(len(images), 3)

        for image in images:
            self.assertEqual(image.dataset_id, ds_id)

        self.assertEqual(images[0].name, '02')
        self.assertEqual(images[1].name, '01')
        self.assertEqual(images[2].name, '69')

        self.assertEqual(images[0].relative_path, '02.jpg')
        self.assertEqual(images[1].relative_path, '01.jpg')
        self.assertEqual(images[2].relative_path, '69.jpg')

        self.assertEqual(images[0].label, '1')
        self.assertEqual(images[1].label, '0')
        self.assertEqual(images[2].label, '0')

    def test_zipfile_someimgs(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            description=DATASET_DESCRIPTION,
            file=good_zipfile_imgs()
        ), mimetype='multipart/form-data')

        self.assertEqual(rv.status_code, 201)
        ds_id = self._assertDatasetCreated()
        self._assertImagesCreated()

        dataset_folder = os.path.join(test_app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 4)
        self.assertEqual(dataset_files[0], '02.jpg')
        self.assertEqual(dataset_files[1], '01.jpg')
        self.assertEqual(dataset_files[2], '69.jpg')
        self.assertEqual(dataset_files[3], LABELS_FILENAME)

        with open(os.path.join(dataset_folder, LABELS_FILENAME), mode='r', newline='') as csvf:
            labelsreader = csv.reader(csvf, delimiter=',')
            rows = list(labelsreader)
            self.assertEqual(len(rows), 4)
            self.assertEqual(rows[0], ['image', 'label'])
            self.assertEqual(rows[1], ['01.jpg', 'class1'])
            self.assertEqual(rows[2], ['02.jpg', 'class2'])
            self.assertEqual(rows[3], ['69.jpg', 'class1'])
