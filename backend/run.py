from flask import Flask
from flask_socketio import SocketIO

from app.nnvis.models import db
from app.nnvis.views import nnvis, register_socketsio_events

from app import create_app

app = create_app('config')
app.app_context().push()

socketio = SocketIO(app, logger=True, path="/socketio")
register_socketsio_events(socketio)

if __name__ == '__main__':
    socketio.run(app, log_output=True,
                 host=app.config['HOST'],
                 port=app.config['PORT'])
