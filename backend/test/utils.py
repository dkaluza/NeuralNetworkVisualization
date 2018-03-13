import json

TEST_USER = 'dzjkb'
TEST_PSWD = 'dzjkb'

def login(app):
    ''' returns the access token '''
    rv = app.post('/authenticate', data=dict(
        username=TEST_USER,
        password=TEST_PSWD
    ))

    assert rv.status == '200'
    return rv.data['access_token']

def response_json(response):
    ''' return data dict from the response, assumes the response is from a rest endpoint '''
    return json.loaresponse.get_data().decode