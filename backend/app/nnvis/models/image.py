from db import db, CRUD

class Image(db.Model, CRUD):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=64, nullable=False)
    path = db.Column(db.Text(256), nullable=False)

    def __init__(self, imageName, imagePath):
        self.imageName = imageName
        self.imagePath = imagePath

    def json(self):
        return {'imageName': self.imageName, 'imagePath': self.imagePath}