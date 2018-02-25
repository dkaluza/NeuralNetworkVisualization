from db import db, CRUD

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
        from datetime import datetime
        self.last_modified = datetime.utcnow()

    def __repr__(self):
        return '<Archtecture {name}>'.format(name=self.name)
