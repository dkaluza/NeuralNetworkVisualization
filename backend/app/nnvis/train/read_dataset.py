import numpy as np
import os
import imageio

from app.nnvis.models import Dataset, Image


def get_train_ids(dataset_id):
    images = Image.query.filter_by(dataset_id=dataset_id).all()
    ids = np.array([image.id for image in images])
    return ids


def get_valid_ids(dataset_id):
    # TODO: get_valid_ids
    return get_train_ids(dataset_id)


def read_data(dataset_id, ids):
    xs = []
    ys = []

    dataset = Dataset.query.get(dataset_id)
    labels = list(eval(dataset.labels))
    labels = [str(l) for l in labels]
    labels_dict = {}
    for i, label in enumerate(labels):
        labels_dict[label] = i
    labels_num = len(labels)

    for i in ids:
        image = Image.query.get(int(i))
        x = imageio.imread(os.path.join(dataset.path, image.relative_path))
        y = np.zeros(labels_num)
        y[labels_dict[image.label]] = 1.

        xs.append(x)
        ys.append(y)

    return np.array(xs), np.array(ys)


def shuffle(ids):
    np.random.shuffle(ids)
    return ids


def split_into_batches(ids, batch_size):
    N = len(ids)
    i = 0

    while i + batch_size < N:
        j = i + batch_size
        yield ids[i:j]
        i = j

    yield ids[i:]


def split_into_train_and_valid(ids, perc):
    N = len(ids)
    ids = shuffle(ids)
    train = ids[:int(N * perc)]
    valid = ids[int(N * perc):]
    return train, valid