from flask import Flask
from app.nnvis.models import db
from app.nnvis.views import nnvis
from app.nnvis.auth_init import auth_init
from flask_cors import CORS
from flask_jwt_extended import JWTManager

import os


def create_app(config_filename):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_filename)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    jwt = JWTManager(app)
    auth_init(jwt)

    app.register_blueprint(nnvis, url_prefix='/')

    if not os.path.isdir(app.config['WEIGHTS_DIR']):
        if os.path.exists(app.config['WEIGHTS_DIR']):
            raise RuntimeError('Weights folder exists but is not a folder')
        os.makedirs(app.config['WEIGHTS_DIR'])

    return app
