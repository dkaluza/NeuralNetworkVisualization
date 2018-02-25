from flask import Flask
from db import db
from app.nnvis.views import nnvis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

db.init_app(app)
@app.before_first_request
def create_tables():
    db.create_all()

app.register_blueprint(nnvis, url_prefix='/')

if __name__ == '__main__':
    app.run(host=app.config['HOST'],
            port=app.config['PORT'])
