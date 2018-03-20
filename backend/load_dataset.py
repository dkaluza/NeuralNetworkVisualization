from app import create_app
import argparse
import os

from app.nnvis.models import Dataset
from app.nnvis.rests.dataset import unzip_validate_archive

parser = argparse.ArgumentParser()
parser.add_argument('-n', '--name', type=str, required=True)
parser.add_argument('-d', '--description', type=str, default=None)
parser.add_argument('-f', '--file', type=str, required=True)
parser.add_argument('-l', '--labels', type=str, default=None)
parser.add_argument('--user_id', type=int, required=True)

if __name__ == '__main__':
    app = create_app('config')
    args = parser.parse_args()

    path = os.path.join(app.config['DATASET_FOLDER'], args.name)

    ctx = app.app_context()
    ctx.push()

    dataset = Dataset(
            name=args.name,
            description=args.description,
            path=path,
            labels=args.labels,
            user_id=args.user_id)

    try:
        dataset.add()
        unzip_validate_archive(path, args.file, dataset.id)
    except Exception as e:
        dataset.delete()
        print(e)

    ctx.pop()
