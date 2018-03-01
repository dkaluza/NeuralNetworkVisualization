from flask import request
from flask_restful import abort, Resource
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from app.nnvis.models import User


class AuthenticationTask(Resource):
    def __abort_if_user_doesnt_exist(self, user, username):
        if user is None:
            self.__abort(username)

    def __abort(self, username):
        message = 'User {username} doesn\'t exist or the password is incorrect'.format(
            username=username)
        abort(401, message=message)

    def __abort_if_password_doesnt_match(self, user, username, password):
        if not check_password_hash(user.password, password):
            self.__abort(username)

    def post(self):
        args = request.get_json(force=True)
        username = args['username']
        password = args['password']
        user = User.query.filter_by(username=username).first()
        self.__abort_if_user_doesnt_exist(user, username)
        self.__abort_if_password_doesnt_match(user, username, password)

        access_token = create_access_token(identity=username)
        return {'access_token': access_token}, 200
