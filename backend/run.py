from flask import Flask
from db import db
from app.nnvis.views import nnvis

from app import create_app

app = create_app('config')

if __name__ == '__main__':
    app.run(host=app.config['HOST'],
            port=app.config['PORT'])
