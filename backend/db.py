from flask_sqlalchemy import SQLAlchemy

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