import base64


class NnvisException(Exception):
    pass


def fileToB64(fd):
    return base64.b64encode(fd.read()).decode()
