from test import NNvisTestCase
from test.utils import response_json, authorized_post
from test_config import LABELS_FILENAME, CLASSMAP_FILENAME

from app.nnvis.models import Dataset, Image
from app.utils import NnvisException

import zipfile
import csv
import os
from io import BytesIO, StringIO


def create_csv(colnames, *rows):
    f = StringIO()
    fwriter = csv.writer(f, delimiter=',')
    fwriter.writerow(colnames)

    for r in rows:
        fwriter.writerow(r)

    return f.getvalue()


def bad_zipfile():
    return (BytesIO(b'test'), 'bad.zip')


def good_zipfile_noimgs():
    retfile = BytesIO()
    labelfilestr = create_csv(['image', 'label'])
    classfilestr = create_csv(['class_number', 'class_name'])

    with zipfile.ZipFile(
            retfile, mode="x", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)
        thezip.writestr(CLASSMAP_FILENAME, classfilestr)

    retfile.seek(0)
    return (retfile, 'noimg.zip')


def good_zipfile_unmapped_classes():
    retfile = BytesIO()
    labelfilestr = create_csv(
        ['image', 'label'],
        ['01.jpg', '0'],
        ['02.jpg', '1'],
        ['69.jpg', '2']
    )
    classfilestr = create_csv(
        ['class_number', 'class_name'],
        ['0', 'class1'],
        ['1', 'class2']
    )

    with zipfile.ZipFile(
            retfile, mode="w", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)
        thezip.writestr(CLASSMAP_FILENAME, classfilestr)
        thezip.writestr('01.jpg', 'eeeeeagbdfvdfdgfbdafd')
        thezip.writestr('02.jpg', 'raboerijbaoeribriribv')
        thezip.writestr('69.jpg', 'bcvnxm,zxzxnbnnnneeef')

    retfile.seek(0)
    return (retfile, 'imgs.zip')


def good_zipfile_bad_classes():
    retfile = BytesIO()
    labelfilestr = create_csv(
        ['image', 'label'],
        ['01.jpg', '0'],
        ['02.jpg', '2'],
        ['69.jpg', '0']
    )
    classfilestr = create_csv(
        ['class_number', 'class_name'],
        ['0', 'class1'],
        ['2', 'class2']
    )

    with zipfile.ZipFile(
            retfile, mode="w", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)
        thezip.writestr(CLASSMAP_FILENAME, classfilestr)
        thezip.writestr('01.jpg', 'eeeeeagbdfvdfdgfbdafd')
        thezip.writestr('02.jpg', 'raboerijbaoeribriribv')
        thezip.writestr('69.jpg', 'bcvnxm,zxzxnbnnnneeef')

    retfile.seek(0)
    return (retfile, 'imgs.zip')


def good_zipfile_imgs(labels_content, classmap_content):
    retfile = BytesIO()
    labelfilestr = create_csv(*labels_content)
    classfilestr = create_csv(*classmap_content)

    with zipfile.ZipFile(
            retfile, mode="w", compression=zipfile.ZIP_DEFLATED) as thezip:
        thezip.writestr(LABELS_FILENAME, labelfilestr)
        thezip.writestr(CLASSMAP_FILENAME, classfilestr)
        for l in labels_content[1:]:
            thezip.writestr(l[0], 'raboerijbaoeribriribv')

    retfile.seek(0)
    return (retfile, 'imgs.zip')


DATASET_NAME = 'testname'
DATASET_DESCRIPTION = 'testdesc'


class UploadNewDatasetTest(NNvisTestCase):

    def test_nofile(self):
        rv = authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    name=DATASET_NAME,
                    description=DATASET_DESCRIPTION),
                mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'No dataset file attached')

    def test_noname(self):
        rv = authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    description=DATASET_DESCRIPTION,
                    file=bad_zipfile()),
                mimetype='multipart/form-data')

        rjson = response_json(rv)

        self.assertEqual(rv.status_code, 400)
        self.assertEqual(rjson['message'], 'Name for new dataset required')

    def test_bad_zipfile(self):
        with self.assertRaises(zipfile.BadZipfile):
            authorized_post(
                    self.client, '/upload_dataset', self.access_token,
                    data=dict(
                        name=DATASET_NAME,
                        description=DATASET_DESCRIPTION,
                        file=bad_zipfile()),
                    mimetype='multipart/form-data')

    def test_zipfile_unmapped_classes(self):
        with self.assertRaises(NnvisException):
            authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    name=DATASET_NAME,
                    description=DATASET_DESCRIPTION,
                    file=good_zipfile_unmapped_classes()),
                mimetype='multipart/form-data'
            )


    def test_zipfile_bad_classes(self):
        with self.assertRaises(NnvisException):
            authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    name=DATASET_NAME,
                    description=DATASET_DESCRIPTION,
                    file=good_zipfile_bad_classes()),
                mimetype='multipart/form-data'
            )


    def test_zipfile_noimgs(self):
        rv = authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    name=DATASET_NAME,
                    description=DATASET_DESCRIPTION,
                    file=good_zipfile_noimgs()),
                mimetype='multipart/form-data')

        self.assertEqual(rv.status_code, 201)
        ds_id = self._assertDatasetCreated()
        self.assertEqual(len(Image.query.all()), 0)

        dataset_folder = os.path.join(
                self.app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 2)
        self.assertEqual(dataset_files[0], LABELS_FILENAME)
        self.assertEqual(dataset_files[1], CLASSMAP_FILENAME)

        self._assertCsvContent(
            os.path.join(dataset_folder, LABELS_FILENAME),
            [['image', 'label']]
        )

        self._assertCsvContent(
            os.path.join(dataset_folder, CLASSMAP_FILENAME),
            [['class_number', 'class_name']]
        )

    def _assertCsvContent(self, fpath, expected_content):
        with open(fpath, mode='r', newline='') as csvf:
            freader = csv.reader(csvf, delimiter=',')
            rows = list(freader)
            self.assertEqual(len(rows), len(expected_content))

            for row, expected_row in zip(rows, expected_content):
                self.assertEqual(row, expected_row)

    def _assertDatasetCreated(self, labels=None):
        datasets = Dataset.query.all()
        self.assertEqual(len(datasets), 1)
        ds = datasets[0]
        self.assertEqual(ds.name, DATASET_NAME)
        if labels:
            self.assertEqual(ds.labels.split(','), labels)
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

        self.assertEqual(images[0].label, '10')
        self.assertEqual(images[1].label, '0')
        self.assertEqual(images[2].label, '2')

    def test_zipfile_someimgs(self):
        labels_content = [
            ['image', 'label'],
            ['01.jpg', '0'],
            ['02.jpg', '10'],
            ['69.jpg', '2']
        ]
        classmap_content = [
            ['class_number', 'class_name'],
            ['0', 'class0'],
            ['1', 'class1'],
            ['2', 'class2'],
            ['3', 'class3'],
            ['4', 'class4'],
            ['5', 'class5'],
            ['6', 'class6'],
            ['7', 'class7'],
            ['8', 'class8'],
            ['9', 'class9'],
            ['10', 'class10'],
        ]

        rv = authorized_post(
                self.client, '/upload_dataset', self.access_token,
                data=dict(
                    name=DATASET_NAME,
                    description=DATASET_DESCRIPTION,
                    file=good_zipfile_imgs(labels_content, classmap_content)),
                mimetype='multipart/form-data')
        self.assertEqual(rv.status_code, 201)
        ds_id = self._assertDatasetCreated(
            labels=[
                'class0',
                'class1',
                'class2',
                'class3',
                'class4',
                'class5',
                'class6',
                'class7',
                'class8',
                'class9',
                'class10',
            ]
        )
        self._assertImagesCreated()

        dataset_folder = os.path.join(
                self.app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 5)
        self.assertEqual(dataset_files[0], '02.jpg')
        self.assertEqual(dataset_files[1], '01.jpg')
        self.assertEqual(dataset_files[2], '69.jpg')
        self.assertEqual(dataset_files[3], LABELS_FILENAME)
        self.assertEqual(dataset_files[4], CLASSMAP_FILENAME)

        self._assertCsvContent(
            os.path.join(dataset_folder, LABELS_FILENAME),
            labels_content
        )

        self._assertCsvContent(
            os.path.join(dataset_folder, CLASSMAP_FILENAME),
            classmap_content
        )
