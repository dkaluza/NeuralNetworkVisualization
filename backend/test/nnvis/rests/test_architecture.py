from test import NNvisTestCase
from app.nnvis.models import Architecture
from test.utils import (add_testuser, login, authorized_post,
                        response_json, auth_get, auth_delete)
import json


class ArchitectureTaskTest(NNvisTestCase):

    def setUp(self):
        super().setUp()
        node1 = {
            'id': '1',
            'label': 'input',
            'layerType': 'input',
            'params': {
                'shape': '-1, 28, 28, 1'
                }
        }
        node2 = {
            'id': '2',
            'label': 'fc',
            'layerType': 'fc',
            'params': {
                'numOutputs': 10,
                'activation': 'Sigmoid'
            }
        }
        links = [{'source': '1', 'target': '2'}]
        self.graph = {'nodes': [node1, node2], 'links': links}
        arch = Architecture(
                'arch', 'desc', json.dumps(self.graph), self.user.id)
        arch.add()

    def _if_arch_doesnt_exist(self, request, **kwargs):
        rv = request(self.client, '/arch/2', self.access_token, **kwargs)
        rjson = response_json(rv)
        self.assertEqual(rv.status_code, 403)
        self.assertEqual(rjson['message'], 'Architecture 2 doesn\'t exist')

    def _if_arch_isnt_owned_by_user(self, request, **kwargs):
        add_testuser('user2', 'user2')
        client = self.app.test_client()
        access_token = login(client, 'user2', 'user2')
        rv = request(client, '/arch/1', access_token, **kwargs)
        rjson = response_json(rv)
        self.assertEqual(rv.status_code, 401)
        self.assertEqual(rjson['message'],
                         "Architecture 1 isn't owned by the user")

    def test_get(self):
        rv = auth_get(self.client, '/arch/1', self.access_token)
        rjson = response_json(rv)
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(rjson['id'], 1)
        self.assertEqual(rjson['name'], 'arch')
        self.assertEqual(rjson['description'], 'desc')
        self.assertDictEqual(rjson['architecture'], self.graph)

    def test_get_if_arch_doesnt_exist(self):
        self._if_arch_doesnt_exist(auth_get)

    def test_get_if_arch_isnt_owned_by_user(self):
        self._if_arch_isnt_owned_by_user(auth_get)

    def test_delete(self):
        rv = auth_delete(self.client, '/arch/1', self.access_token)
        self.assertEqual(rv.status_code, 204)
        self.assertEqual(Architecture.query.all(), [])

    def test_delete_if_arch_doesnt_exist(self):
        self._if_arch_doesnt_exist(auth_delete)

    def test_delete_if_arch_isnt_owned_by_user(self):
        self._if_arch_isnt_owned_by_user(auth_delete)

    def test_post(self):
        data = json.dumps({'name': 'new name', 'description': 'new desc'})
        rv = authorized_post(
                self.client, '/arch/1', self.access_token,
                data=data, content_type='application/json')
        self.assertEqual(rv.status_code, 201)
        arch = Architecture.query.get(1)
        self.assertEqual(arch.name, 'new name')
        self.assertEqual(arch.description, 'new desc')

    def test_post_if_arch_doesnt_exist(self):
        data = dict(name='new name', description='new desc')
        self._if_arch_doesnt_exist(authorized_post, data=data)

    def test_post_if_arch_isnt_owned_by_user(self):
        data = dict(name='new name', description='new desc')
        self._if_arch_isnt_owned_by_user(authorized_post, data=data)
