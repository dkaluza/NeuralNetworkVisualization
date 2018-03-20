from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from app.nnvis.auth_init import auth_init
from flask_cors import CORS
from flask_jwt_extended import JWTManager

import os

db = SQLAlchemy()
nnvis = Blueprint('nnvis', __name__)


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

    if not os.path.isdir(app.config['DATASET_FOLDER']):
        if os.path.exists(app.config['DATASET_FOLDER']):
            raise RuntimeError('Dataset folder exists but is not a folder')

        os.makedirs(app.config['DATASET_FOLDER'])

    return app
