from app import db

from flask import current_app as app
from datetime import datetime
from shutil import rmtree
import os
from werkzeug.security import generate_password_hash


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

    def add(self):
        super().add()
        path = os.path.join(app.config['WEIGHTS_DIR'],
                            '{id}'.format(id=self.id))
        os.makedirs(path)

    def delete(self):
        path = os.path.join(app.config['WEIGHTS_DIR'],
                            '{id}'.format(id=self.id))
        if os.path.isdir(path):
            os.rmdir(path)
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
        path = os.path.join(app.config['WEIGHTS_DIR'],
                            '{arch}/{model}/'.format(
                                arch=self.arch_id, model=self.id)
                            )
        self.weights_path = path
        super().add()

    def delete(self):
        path = os.path.join(app.config['WEIGHTS_DIR'],
                            '{arch}/{model}/'.format(
                                arch=self.arch_id, model=self.id)
                            )
        if os.path.isdir(path):
            rmtree(path, True)
        super().delete()


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
    models = db.relationship('Model', backref='dataset', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    images = db.relationship('Image', cascade='all, delete-orphan',
                             backref='dataset', lazy=True)

    __table_args__ = (
        db.UniqueConstraint('name', 'user_id', name='_name_userid_uc'),
    )

    def __init__(self, name, description, path, labels, user_id):
        self.name = name
        self.description = description
        self.path = path
        self.labels = labels
        self.user_id = user_id

    def __repr__(self):
        return '<Dataset {id} {name} of user {user_id}>'.format(
            id=self.id, name=self.name, user_id=self.user_id)

    def class_num_to_name_dict(self):
        return {str(i): c for i, c in enumerate(self.labels.split(','))}


class Image(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    relative_path = db.Column(db.Text(256), nullable=False)
    label = db.Column(db.Text(256), nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'),
                           nullable=False)

    __table_args__ = (
        db.UniqueConstraint('name', 'dataset_id', name='_name_dataset_id_uc'),
    )

    def __init__(self, imageName, relPath, label, dataset_id):
        self.name = imageName
        self.relative_path = relPath
        self.label = label
        self.dataset_id = dataset_id

    def json(self):
        return {'id': self.id, 'name': self.name, 'relative_path': self.relative_path,
                'label': self.label, 'dataset_id': self.dataset_id}


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
