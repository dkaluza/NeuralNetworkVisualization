import os

HOST = '127.0.0.1'
PORT = 5000

SQLALCHEMY_DATABASE_URI = 'sqlite:///models.db'
JWT_SECRET_KEY = 'we_need_some_secret_key'

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), 'app', 'weights')

DATASET_FOLDER = os.path.join(os.path.dirname(__file__), 'app', 'datasets')
LABELS_FILENAME = 'labels.csv'
