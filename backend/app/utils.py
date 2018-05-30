import base64
from io import BytesIO
import cv2

class NnvisException(Exception):
    pass


def fileToB64(fd):
    return base64.b64encode(fd.read()).decode()


def numpyToB64(array):
    f = BytesIO(cv2.imencode('.png', array)[1].tostring())
    return fileToB64(f)

def save_image(image, proc=None):
    if proc:
        image = proc(image)
    return BytesIO(cv2.imencode('.png', image)[1].tostring())