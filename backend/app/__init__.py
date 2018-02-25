from flask import Flask
from db import db
from app.nnvis.views import nnvis


def create_app(config_filename):
    app = Flask(__name__)
    app.config.from_object(config_filename)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    app.register_blueprint(nnvis, url_prefix='/')

    return app
