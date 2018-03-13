import os

HOST = '127.0.0.1'
PORT = 5000

TEST_DB_FILENAME = 'test_models.db'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + TEST_DB_FILENAME
JWT_SECRET_KEY = 'we_need_some_secret_key'

TMP_FOLDER = os.path.join(os.getenv('HOME'), 'nnvis_test_tmp')
DATASET_FOLDER = os.path.join(TMP_FOLDER, 'datasets')
LABELS_FILENAME = 'labels.csv'
