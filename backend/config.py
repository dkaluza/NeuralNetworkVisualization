HOST = '127.0.0.1'
PORT = 5000

SQLALCHEMY_DATABASE_URI = 'sqlite:///models.db'
JWT_SECRET_KEY = 'we_need_some_secret_key'

ROOT_DIR = '/shared/backend/app/'

WEIGHTS_DIR = ROOT_DIR + '/nnvis/weights'

DATASET_FOLDER = ROOT_DIR + '/nnvis/datasets'
LABELS_FILENAME = 'labels.csv'
