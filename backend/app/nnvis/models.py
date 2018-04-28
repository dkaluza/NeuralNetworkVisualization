from app import db

from flask import current_app as app
from datetime import datetime
from shutil import rmtree
import os
import json
from werkzeug.security import generate_password_hash

from app.nnvis.train.losses import get_loss
from app.nnvis.train.optimizers import get_optimizer


class CRUD():

    def add(self):
        db.session.add(self)
        return db.session.commit()

    def update(self):
        return db.session.commit()

    def delete(self):
        db.session.delete(self)
        return db.session.commit()


class Architecture(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text(256))
    graph = db.Column(db.Text, nullable=False)
    last_used = db.Column(db.Date)
    last_modified = db.Column(db.Date)
    models = db.relationship('Model', backref='architecture', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                        nullable=False)

    __table_args__ = (
        db.UniqueConstraint('name', 'user_id', name='_name_userid_uc'),
    )

    def __init__(self, name, description, graph, user_id):
        self.name = name
        self.description = description
        self.user_id = user_id

        self.graph = graph
        self.last_used = None
        self.last_modified = datetime.utcnow()

    def __repr__(self):
        return '<Archtecture {id} {name} of user {user_id}>'.format(
            id=self.id, name=self.name, user_id=self.user_id)

    def to_dict(self):
        if self.last_used is not None:
            last_used = self.last_used.strftime('%Y-%m-%d')
        else:
            last_used = 'None'

        return {
                'id': self.id,
                'name': self.name,
                'description': self.description,
                'architecture': json.loads(self.graph),
                'last_used': last_used,
                'last_modified': self.last_modified.strftime('%Y-%m-%d')
                }

    def get_folder_path(self):
        return os.path.join(app.config['WEIGHTS_DIR'],
                            '{id}'.format(id=self.id))

    def get_meta_file_path(self):
        return os.path.join(self.get_folder_path(), 'graph.meta')

    def add(self):
        super().add()
        os.makedirs(self.get_folder_path())

    def delete(self):
        path = self.get_folder_path()
        if os.path.isdir(path):
            rmtree(path)
        super().delete()


class Model(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text(256))
    weights_path = db.Column(db.Text(256), nullable=False)
    arch_id = db.Column(db.Integer, db.ForeignKey('architecture.id'),
                        nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'))
    training_params = db.Column(db.Text)
    validation_loss = db.Column(db.Float)
    training_loss = db.Column(db.Float)
    training_history = db.relationship('TrainingHistory', backref='model', lazy=True,
                                       cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint('name', 'arch_id',
                            name='_name_archid_uc'),
    )

    def __init__(self, name, description, weights_path,
                 arch_id, dataset_id=None, params=None,
                 valid_loss=None, train_loss=None):
        self.name = name
        self.description = description
        self.weights_path = weights_path
        self.arch_id = arch_id
        self.dataset_id = dataset_id
        self.training_params = params
        self.validation_loss = valid_loss
        self.training_loss = train_loss

    def __repr__(self):
        return '<Model {id} {name}>'.format(id=self.id, name=self.name)

    def add(self):
        self.weights_path = os.path.join(
                app.config['WEIGHTS_DIR'],
                str(self.arch_id),
                str(self.id))
        super().add()

    def delete(self):
        if os.path.isdir(self.weights_path):
            rmtree(self.weights_path, True)
        super().delete()

    def get_folder_path(self):
        return os.path.join(
                app.config['WEIGHTS_DIR'],
                str(self.arch_id),
                str(self.id))

    def get_data_file_path(self):
        return os.path.join(
                self.get_folder_path(),
                'model.data-00000-of-00001')

    def get_index_file_path(self):
        return os.path.join(
                self.get_folder_path(),
                'model.index')

    def to_dict(self):
        if self.training_params is not None:
            params = json.loads(self.training_params)
            params['loss'] = get_loss(params['loss'])['name']

            opt = get_optimizer(params['optimizer'])
            params['optimizer'] = opt['name']
            params['optimizer_params'] = [
                {
                    'name': p['name'],
                    'value': params['optimizer_params'][p['id']]
                }
                for p in opt['params']
            ]
        else:
            params = {
                    'loss': 'none',
                    'optimizer': 'none',
                    'optimizer_params': None,
                    'batch_size': None,
                    'nepochs': None,
                    }

        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'valid_loss': self.validation_loss,
            'train_loss': self.training_loss,
            'loss': params['loss'],
            'optimizer': params['optimizer'],
            'optimizer_params': params['optimizer_params'],
            'batch_size': params['batch_size'],
            'nepochs': params['nepochs']
        }


class TrainingHistory(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('model.id'),
                         nullable=False)
    batch_size = db.Column(db.Integer)
    current_epoch = db.Column(db.Integer)
    number_of_epochs = db.Column(db.Integer)
    training_loss = db.Column(db.Float)
    training_acc = db.Column(db.Float)
    validation_loss = db.Column(db.Float)
    validation_acc = db.Column(db.Float)

    def __init__(self, model_id, batch_size, current_epoch,
                 number_of_epochs, training_loss, validation_loss):
        self.model_id = model_id
        self.batch_size = batch_size
        self.current_epoch = current_epoch
        self.number_of_epochs = number_of_epochs
        self.validation_loss = validation_loss
        self.training_loss = training_loss

    def __repr__(self):
        return '<Training {id} model {model_id}>'.format(id=self.id, name=self.model_id)


class Dataset(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text(256))
    path = db.Column(db.Text(256), nullable=False)
    labels = db.Column(db.Text(256), nullable=False)
    imgs_per_sample = db.Column(db.Integer, nullable=False)
    models = db.relationship('Model', backref='dataset', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    training_samples = db.relationship('Trainingsample', cascade='all, delete-orphan',
                             backref='trainingsample', lazy=True)

    __table_args__ = (
        db.UniqueConstraint('name', 'user_id', name='_name_userid_uc'),
    )

    def __init__(self, name, description, path, labels, user_id, imgs_per_sample):
        self.name = name
        self.description = description
        self.path = path
        self.labels = labels
        self.user_id = user_id
        self.imgs_per_sample = imgs_per_sample

    def __repr__(self):
        return '<Dataset {id} {name} of user {user_id}>'.format(
            id=self.id, name=self.name, user_id=self.user_id)

    def class_num_to_name_dict(self):
        return {str(i): c for i, c in enumerate(self.labels.split(','))}


class Trainingsample(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    label = db.Column(db.Text(256), nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'),
                           nullable=False)
    images = db.relationship('Image', cascade='all, delete-orphan',
                             backref='trainingsample', lazy=True)

    __table_args__ = (
        db.UniqueConstraint('name', 'dataset_id', name='_name_dataset_id_uc'),
    )

    def __init__(self, name, label, dataset_id):
        self.name = name
        self.label = label
        self.dataset_id = dataset_id

    def __repr__(self):
        return '<Sample {} id {} of dataset {}'.format(self.name,
                                                       self.id,
                                                       self.dataset_id)


class Image(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    relative_path = db.Column(db.Text(256), nullable=False)
    trainsample_id = db.Column(db.Integer, db.ForeignKey('trainingsample.id'),
                               nullable=False)

    __table_args__ = (
        db.UniqueConstraint('name', 'trainsample_id', name='_name_trainsample_id_uc'),
    )

    def __init__(self, imageName, relPath, trainsample_id):
        self.name = imageName
        self.relative_path = relPath
        self.trainsample_id = trainsample_id

    def json(self):
        return {'id': self.id, 'name': self.name, 'relative_path': self.relative_path,
                'label': self.label, 'dataset_id': self.dataset_id}

    def full_path(self):
        ts = Trainingsample.query.get(self.trainsample_id)
        ds_path = Dataset.query.get(ts.dataset_id).path
        return os.path.join(ds_path, self.relative_path)

    def __repr__(self):
        return '<Image {} located at {} of training sample {}'.format(
            self.name, self.relative_path, self.trainsample_id
        )


class User(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)
    archs = db.relationship('Architecture', backref='user', lazy=True,
                            cascade="all, delete-orphan")
    datasets = db.relationship('Dataset', backref='user', lazy=True,
                               cascade="all, delete-orphan")

    def __init__(self, username, password):
        self.username = username
        self.password = generate_password_hash(password)

    def __repr__(self):
        return '<User {id} {username}>'.format(
            id=self.id, username=self.username)
