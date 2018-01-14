from flask import Flask

app = Flask(__name__)


@app.route('/')
def init():
    """Return initial page HTML"""
    return 'Hello ZPP!'
