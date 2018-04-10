from app import create_app
from app.nnvis import views

from test_config import TEST_DB_FILENAME
from test.utils import add_testuser, login
import os
import shutil
import logging
import unittest

logging.disable(logging.CRITICAL)

TEST_DB_PATH = os.path.join('app', TEST_DB_FILENAME)


class NNvisTestCase(unittest.TestCase):
    def setUp(self):
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
        self.app = create_app('test_config')
        self.app.testing = True
        self.app.app_context().push()
        self.user = add_testuser('user', 'user')
        self.client = self.app.test_client()
        self.access_token = login(self.client, 'user', 'user')

    def tearDown(self):
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
        if os.path.exists(self.app.config['DATASET_FOLDER']):
            shutil.rmtree(self.app.config['DATASET_FOLDER'])
        if os.path.exists(self.app.config['WEIGHTS_DIR']):
            shutil.rmtree(self.app.config['WEIGHTS_DIR'])
