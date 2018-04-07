import json

from app.nnvis.models import User

TEST_USER = 'dzjkb'
TEST_PSWD = 'dzjkb'

def add_testuser():
    user = User(username=TEST_USER,
                password=TEST_PSWD)
    user.add()

def login(test_client):
    ''' returns the access token '''
    rv = test_client.post('/authenticate', data=req_json({
        'username': TEST_USER,
        'password': TEST_PSWD
    }))

    assert rv.status == '200 OK'
    return response_json(rv)['access_token']

def response_json(response):
    ''' return data dict from the response, assumes the response is from a rest endpoint '''
    return json.loads(response.get_data().decode('utf-8'))

def req_json(datadict):
    return json.dumps(datadict)

def auth_header(access_token):
    return {'Authorization': 'Bearer {}'.format(access_token)}

def authorized_post(client, url, access_token, **kwargs):
    return client.post(url, headers=auth_header(access_token), **kwargs)
