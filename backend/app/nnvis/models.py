from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash


db = SQLAlchemy()


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
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text(256))
    graph = db.Column(db.Text, nullable=False)
    last_used = db.Column(db.Date)
    last_modified = db.Column(db.Date)
    models = db.relationship('Model', backref='architecture', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                        nullable=False)

    def __init__(self, name, description, graph, user_id):
        self.name = name
        self.description = description
        self.user_id = user_id

        self.graph = graph
        self.last_used = None
        self.last_modified = datetime.utcnow()

    def __repr__(self):
        return '<Archtecture {id} {name} of user {user_id}>'.format(id=self.id,
                                                                    name=self.name,
                                                                    user_id=self.user_id)


class Model(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text(256))
    weights_path = db.Column(db.Text(256), nullable=False)
    arch_id = db.Column(db.Integer, db.ForeignKey('architecture.id'),
                        nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'))

    def __init__(self, name, description, weights_path, arch_id, dataset_id=None):
        self.name = name
        self.description = description
        self.weights_path = weights_path
        self.arch_id = arch_id
        self.dataset_id = dataset_id

    def __repr__(self):
        return '<Model {id} {name}>'.format(id=self.id, name=self.name)


class Dataset(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=64, nullable=False)
    description = db.Column(db.Text(256))
    path = db.Column(db.Text(256), nullable=False)
    labels = db.Column(db.Text(256), nullable=False)
    models = db.relationship('Model', backref='dataset', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    images = db.relationship('Image', backref='dataset', lazy=True)

    def __init__(self, name, description, path, labels, user_id):
        self.name = name
        self.description = description
        self.path = path
        self.labels = labels
        self.user_id = user_id

    def __repr__(self):
        return '<Dataset {id} {name} of user {user_id}>'.format(id=self.id, name=self.name,
                                                                user_id=self.user_id)


class Image(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=64, nullable=False)
    relative_path = db.Column(db.Text(256), nullable=False)
    label = db.Column(db.Text(256), nullable=False)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'), nullable=False)

    def __init__(self, imageName, relPath, label, dataset_id):
        self.name = imageName
        self.relative_path = relPath
        self.label = label
        self.dataset_id = dataset_id

    def json(self):
        return {'imageName': self.imageName, 'imagePath': self.imagePath}


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
        return '<User {id} {username}>'.format(id=self.id, username=self.username)
