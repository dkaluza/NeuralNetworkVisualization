from run import app
import unittest

class UploadNewDatasetTest(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_true_is_true(self):
        self.assertTrue(True)

    def test_false_is_false(self):
        self.assertFalse(False)

    def test_nofile(self):
        rv = self.app.post('/upload_dataset', data=dict(
            
        ))
