from eventlet import monkey_patch
monkey_patch(os=True, select=True, socket=True, time=True, psycopg=True)
from flask import Flask
from flask_socketio import SocketIO

from app.nnvis.models import db
from app.nnvis.db_events import db_events_init
from app.nnvis.views import nnvis, register_socketsio_events

from app import create_app

app = create_app('config')
app.app_context().push()

socketio = SocketIO(app, logger=True, path="/socketio",
                    message_queue='amqp://', ping_interval=40, ping_timeout=90)
register_socketsio_events(socketio)
db_events_init(db)

if __name__ == '__main__':
    socketio.run(app, log_output=True, debug=True,
                 host=app.config['HOST'],
                 port=app.config['PORT'])
