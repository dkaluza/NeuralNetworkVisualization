from flask import Flask
from app.nnvis.models import db
from app.nnvis.views import nnvis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

db.init_app(app)
with app.app_context():
    db.create_all()

app.register_blueprint(nnvis, url_prefix='/')

if __name__ == '__main__':
    app.run(host=app.config['HOST'],
            port=app.config['PORT'])
