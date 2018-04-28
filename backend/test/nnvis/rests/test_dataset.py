from test import NNvisTestCase
from test.utils import response_json, authorized_post
from test_config import LABELS_FILENAME, CLASSMAP_FILENAME

from app.nnvis.models import Dataset, Image
from app.nnvis.models import Trainingsample as TrainingSample
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
        for row in labels_content[1:]:
            for img in row[:-1]:
                thezip.writestr(img, 'raboerijbaoeribriribv')

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
        ds_id = self._assertDatasetCreated(1)
        self.assertEqual(len(Image.query.all()), 0)
        self.assertEqual(len(TrainingSample.query.all()), 0)

        dataset_folder = os.path.join(
                self.app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 2)
        self.assertIn(LABELS_FILENAME, dataset_files)
        self.assertIn(CLASSMAP_FILENAME, dataset_files)

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

    def _assertDatasetCreated(self, imgs_per_sample, labels=None):
        datasets = Dataset.query.all()
        self.assertEqual(len(datasets), 1)
        ds = datasets[0]
        self.assertEqual(ds.name, DATASET_NAME)
        if labels:
            self.assertEqual(ds.labels.split(','), labels)
        self.assertEqual(ds.description, DATASET_DESCRIPTION)
        self.assertEqual(ds.imgs_per_sample, imgs_per_sample)

        return ds.id

    def _assertImagesCreated(self, imgs, imgs_per_sample):
        images = Image.query.all()
        self.assertEqual(len(images), len(imgs))

        image_names = list(map(lambda x: x.name, images))
        for img in imgs:
            self.assertIn(img.split('.', 1)[0], image_names)

        image_paths = list(map(lambda x: x.relative_path, images))
        for img in imgs:
            self.assertIn(img, image_paths)

        image_ts_ids = list(map(lambda x: str(x.trainsample_id), images))
        for i in range(1, len(images) // imgs_per_sample + 1):
            self.assertIn(str(i), image_ts_ids)

    def _assertTrainingSamplesCreated(self):
        tss = TrainingSample.query.all()
        ds_id = Dataset.query.all()[0].id

        for ts in tss:
            self.assertEqual(ts.dataset_id, ds_id)

        self.assertEqual(len(tss), 3)

        ts_names = list(map(lambda x: x.name, tss))
        for i in range(3):
            self.assertIn('Training sample {}'.format(i), ts_names)

        ts_labels = list(map(lambda x: str(x.label), tss))
        self.assertIn('10', ts_labels)
        self.assertIn('0', ts_labels)
        self.assertIn('2', ts_labels)

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
        ds_id = self._assertDatasetCreated(1,
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
        self._assertImagesCreated([
            '01.jpg', '02.jpg', '69.jpg'
        ], 1)
        self._assertTrainingSamplesCreated()

        dataset_folder = os.path.join(
                self.app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 5)
        self.assertIn('02.jpg', dataset_files)
        self.assertIn('01.jpg', dataset_files)
        self.assertIn('69.jpg', dataset_files)
        self.assertIn(LABELS_FILENAME, dataset_files)
        self.assertIn(CLASSMAP_FILENAME, dataset_files)

        self._assertCsvContent(
            os.path.join(dataset_folder, LABELS_FILENAME),
            labels_content
        )

        self._assertCsvContent(
            os.path.join(dataset_folder, CLASSMAP_FILENAME),
            classmap_content
        )

    def test_zipfile_multiimg_samples(self):
        labels_content = [
            ['img1', 'img2', 'img3', 'label'],
            ['01.jpg', '02.jpg', '03.jpg', '0'],
            ['04.jpg', '05.jpg', '06.jpg', '10'],
            ['69.jpg', '70.jpg', '71.jpg', '2']
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
        ds_id = self._assertDatasetCreated(3,
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
        self._assertImagesCreated([
            '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg',
            '06.jpg', '69.jpg', '70.jpg', '71.jpg'
        ], 3)
        self._assertTrainingSamplesCreated()

        dataset_folder = os.path.join(
                self.app.config['DATASET_FOLDER'], str(ds_id))
        self.assertTrue(os.path.exists(dataset_folder))
        dataset_files = os.listdir(dataset_folder)
        self.assertEqual(len(dataset_files), 11)
        self.assertIn('02.jpg', dataset_files)
        self.assertIn('01.jpg', dataset_files)
        self.assertIn('03.jpg', dataset_files)
        self.assertIn('04.jpg', dataset_files)
        self.assertIn('05.jpg', dataset_files)
        self.assertIn('06.jpg', dataset_files)
        self.assertIn('69.jpg', dataset_files)
        self.assertIn('70.jpg', dataset_files)
        self.assertIn('71.jpg', dataset_files)
        self.assertIn(LABELS_FILENAME, dataset_files)
        self.assertIn(CLASSMAP_FILENAME, dataset_files)

        self._assertCsvContent(
            os.path.join(dataset_folder, LABELS_FILENAME),
            labels_content
        )

        self._assertCsvContent(
            os.path.join(dataset_folder, CLASSMAP_FILENAME),
            classmap_content
        )
