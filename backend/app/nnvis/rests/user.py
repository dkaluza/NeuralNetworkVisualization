from flask_restful import abort, Resource
from flask_jwt import JWT
from werkzeug.security import check_password_hash

from app.nnvis.models import User


def authenticationTask(app):
    def __abort_if_user_doesnt_exist(user, username):
        if user is None:
            __abort(username)

    def __abort(username):
        message = 'User {username} doesn\'t exist or the password is incorrect'.format(
            username=username)
        abort(401, message=message)

    def __abort_if_password_doesnt_match(user, username, password):
        if not check_password_hash(user.password, password):
            __abort(username)

    def authenticate(username, password):
        user = User.query.all()
        print(user, username, password)
        __abort_if_user_doesnt_exist(user, username)
        __abort_if_password_doesnt_match(user, username, password)

        return user

    def identity(payload):
        username = payload['username']

        return User.query.filter_by(username=username).first()

    jwt = JWT(app, authenticate, identity)
