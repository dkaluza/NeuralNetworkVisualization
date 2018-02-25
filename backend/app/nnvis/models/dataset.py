from db import db, CRUD

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
        return '<Dataset {name}>'.format(name=self.name)