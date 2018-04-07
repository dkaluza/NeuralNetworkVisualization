import json

from app.nnvis.models import User


def add_testuser(username, password):
    user = User(username=username,
                password=password)
    user.add()
    return user


def login(test_client, username, password):
    ''' returns the access token '''
    rv = test_client.post('/authenticate', data=req_json({
        'username': username,
        'password': password
    }))

    print(rv.status)
    assert rv.status == '200 OK'
    return response_json(rv)['access_token']


def response_json(response):
    ''' return data dict from the response,
        assumes the response is from a rest endpoint '''
    return json.loads(response.get_data().decode('utf-8'))


def req_json(datadict):
    return json.dumps(datadict)


def auth_header(access_token):
    return {'Authorization': 'Bearer {}'.format(access_token)}


def authorized_post(client, url, access_token, **kwargs):
    return client.post(url, headers=auth_header(access_token), **kwargs)


def auth_get(client, url, access_token, **kwargs):
    return client.get(url, headers=auth_header(access_token), **kwargs)


def auth_delete(client, url, access_token, **kwargs):
    return client.delete(url, headers=auth_header(access_token), **kwargs)
