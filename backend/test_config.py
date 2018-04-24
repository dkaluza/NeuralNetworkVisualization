import os

HOST = '127.0.0.1'
PORT = 5000

TEST_DB_FILENAME = 'test_models.db'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + TEST_DB_FILENAME
JWT_SECRET_KEY = 'super_secret_stuff_for_testing'

TMP_FOLDER = os.path.join(os.path.dirname(__file__), 'app', 'nnvis_test_tmp')
DATASET_FOLDER = os.path.join(TMP_FOLDER, 'datasets')
WEIGHTS_DIR = os.path.join(TMP_FOLDER, 'weights')
LABELS_FILENAME = 'labels.csv'
CLASSMAP_FILENAME = 'classes.csv'
