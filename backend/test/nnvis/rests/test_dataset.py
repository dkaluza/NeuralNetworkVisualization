from test import test_app
from test.utils import login, response_json, authorized_post
from test_config import TMP_FOLDER, LABELS_FILENAME

from app.nnvis.models import Dataset, Image, User

import zipfile
import csv
import unittest
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
    return (BytesIO(b'dupa'), 'bad.zip', 'bad')

def good_zipfile_noimgs():
    retfile = BytesIO()
    labelfilestr = create_labels(['image', 'label'])
    with zipfile.ZipFile(retfile, mode="x") as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)

    return (retfile, 'noimg.zip', 'noimg')

def good_zipfile_imgs():
    pass

DATASET_NAME = 'dupa'
DATASET_LABELS = 'dupa'
DATASET_DESCRIPTION = 'dupa'

class UploadNewDatasetTest(unittest.TestCase):

    def setUp(self):
        self.client = test_app.test_client()
        self.access_token = login(self.client)
        Dataset.query.delete()
        Image.query.delete()

    def tearDown(self):
        pass

    def test_true_is_true(self):
        self.assertTrue(True)

    def test_false_is_false(self):
        self.assertFalse(False)

    def test_nofile(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            labels=DATASET_LABELS,
            description=DATASET_DESCRIPTION
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'No dataset file attached')

    def test_noname(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            labels=DATASET_LABELS,
            description=DATASET_DESCRIPTION,
            file=bad_zipfile()
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'Name for new dataset required')

    def test_nolabel(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            description=DATASET_DESCRIPTION,
            file=bad_zipfile()
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'Labels for new dataset required')

    def test_bad_zipfile(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            labels=DATASET_LABELS,
            description=DATASET_DESCRIPTION,
            file=bad_zipfile()
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 500)
        self.assertEqual(rjson['message'], 'File is not a zip file')

    def test_zipfile_noimgs(self):
        rv = authorized_post(self.client, '/upload_dataset', self.access_token, data=dict(
            name=DATASET_NAME,
            labels=DATASET_LABELS,
            description=DATASET_DESCRIPTION,
            file=good_zipfile_noimgs()
        ), mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 201)
        self.assertEqual(rjson['message'], '')
        self._assertDatasetCreated()
        self.assertEqual(len(Image.query.all()), 0)

        dataset_folder = os.path.join(test_app.config['DATASET_FOLDER'], DATASET_NAME)
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 1)
        self.assertEqual(dataset_files[0], LABELS_FILENAME)

        with open(os.path.join(dataset_folder, LABELS_FILENAME), mode='r', newline='') as csvf:
            labelsreader = csv.reader(csvf, delimiter=',')
            rows = list(labelsreader)
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0], ['image', 'label'])

    def _assertDatasetCreated(self):
        datasets = Dataset.query.all()
        self.assertEqual(len(datasets), 1)
        ds = datasets[0]
        self.assertEqual(ds.name, DATASET_NAME)
        self.assertEqual(ds.labels, DATASET_LABELS)
        self.assertEqual(ds.description, DATASET_DESCRIPTION)

    def test_zipfile_someimgs(self):
        pass
