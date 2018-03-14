from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.security import generate_password_hash

db = SQLAlchemy()
session = db.create_scoped_session()


class CRUD():

    def add(self):
        session.add(self)
        return session.commit()

    def update(self):
        return session.commit()

    def delete(self):
        session.delete(self)
        return session.commit()


class Architecture(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text(256))
    graph = db.Column(db.Text, nullable=False)
    last_used = db.Column(db.Date)
    last_modified = db.Column(db.Date)
    models = db.relationship('Model', backref='architecture', lazy=True)

    def __init__(self, name, description, graph):
        self.name = name
        self.description = description

        self.graph = graph
        self.last_used = None
        self.last_modified = datetime.utcnow()

    def __repr__(self):
        return '<Archtecture {id} {name}>'.format(id=self.id, name=self.name)

    def add(self):
        super().add()
        os.makedirs('./app/nnvis/weights/{id}/'.format(id=self.id))

    def delete(self):
        path = './app/nnvis/weights/{id}/'.format(id=self.id)
        if os.path.isdir(path):
            os.rmdir(path)
        super().delete()


class Model(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text(256))
    weights_path = db.Column(db.Text(256), nullable=False)
    arch_id = db.Column(db.Integer, db.ForeignKey('architecture.id'),
                        nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'))

    def __init__(self, name, description, weights_path,
                 arch_id, dataset_id=None):
        self.name = name
        self.description = description
        self.weights_path = weights_path
        self.arch_id = arch_id
        self.dataset_id = dataset_id

    def __repr__(self):
        return '<Model {id} {name}>'.format(id=self.id, name=self.name)

    def add(self):
        path = './app/nnvis/weights/{arch_id}/{model_id}/'.format(
                arch_id=self.arch_id, model_id=self.id)
        self.weights_path = path
        super().add()

    def delete(self):
        path = './app/nnvis/weights/{arch_id}/{model_id}'.format(
                  arch_id=self.arch_id, model_id=self.id)
        if os.path.isdir(path):
            for f in os.listdir(path):
                os.remove(os.path.join(path, f))
            os.rmdir(path)
        super().delete()


class Dataset(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=64, nullable=False)
    description = db.Column(db.Text(256))
    trainset_path = db.Column(db.Text(256), nullable=False)
    split_path = db.Column(db.Text(256))
    models = db.relationship('Model', backref='dataset', lazy=True)

    def __init__(self, name, description, trainset_path, split_path):
        self.name = name
        self.description = description
        self.trainset_path = trainset_path
        self.split_path = split_path

    def __repr__(self):
        return '<Dataset {id} {name}>'.format(id=self.id, name=self.name)


# todo
class Image(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=64, nullable=False)
    path = db.Column(db.Text(256), nullable=False)

    def __init__(self, imageName, imagePath):
        self.imageName = imageName
        self.imagePath = imagePath

    def json(self):
        return {'imageName': self.imageName, 'imagePath': self.imagePath}


class User(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.password = generate_password_hash(password)

    def __repr__(self):
        return '<User {username}>'.format(username=self.username)
