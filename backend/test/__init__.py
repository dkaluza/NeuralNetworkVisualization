from app import create_app
from app.nnvis import views

from test_config import TEST_DB_FILENAME
from test.utils import add_testuser
import os
import logging

if os.path.exists(os.path.join('app', TEST_DB_FILENAME)):
    os.remove('app/test_models.db')

test_app = create_app('test_config')
test_app.testing = True
test_app.app_context().push()
logging.disable(logging.CRITICAL)
add_testuser()
