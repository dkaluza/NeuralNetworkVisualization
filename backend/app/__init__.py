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

    if not os.path.isdir(app.config['DATASET_FOLDER']):
        if os.path.exists(app.config['DATASET_FOLDER']):
            raise RuntimeError('Dataset folder is not a folder! wtf?!')

        os.makedirs(app.config['DATASET_FOLDER'])

    return app
