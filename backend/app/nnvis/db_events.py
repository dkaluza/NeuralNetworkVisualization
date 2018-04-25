from flask_socketio import SocketIO

from app.nnvis.rests.train import get_user_models_history, training_history_to_dict
from app.nnvis.models import Model, TrainingHistory


def db_events_init(db):
    socketio = SocketIO(message_queue='amqp://')

    @db.event.listens_for(TrainingHistory, 'after_insert')
    def history_insert_handler(mapper, connection, target):
        model = Model.query.filter_by(id=target.model_id).first()
        _emit_list_update(model.architecture.user_id)

    def _emit_list_update(user_id):
        trainedModels = get_user_models_history(user_id) \
            .filter(TrainingHistory.current_epoch != TrainingHistory.number_of_epochs)

        socketio.emit('list_update', [training_history_to_dict(history)
                                      for history in trainedModels],
                      room='list_update' + str(user_id),
                      namespace='/list_trained_models')

    @db.event.listens_for(TrainingHistory, 'after_update')
    def history_update_handler(mapper, connection, target):
        socketio.emit('new_epoch', training_history_to_dict(target),
                      room='new_epoch' + str(target.id),
                      namespace='/currently_training')

        _emit_list_update(target.model.architecture.user_id)
