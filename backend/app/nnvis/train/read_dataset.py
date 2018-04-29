import numpy as np
import os
import imageio

from app.nnvis.models import Dataset, Image
from app.nnvis.models import Trainingsample as TrainingSample


def get_train_ids(dataset_id):
    trainingsamples = TrainingSample.query.\
            filter_by(dataset_id=dataset_id).all()
    train_sample_ids = list(map(lambda ts: ts.id, trainingsamples))
    return np.array(train_sample_ids)


def get_valid_ids(dataset_id):
    # TODO: get_valid_ids
    return get_train_ids(dataset_id)


def read_data(dataset_id, ids):
    dataset = Dataset.query.get(dataset_id)
    imgs_per_sample = dataset.imgs_per_sample
    labels_num = len(dataset.labels.split(','))

    xs = [[] for _ in range(imgs_per_sample)]
    ys = []

    _ids = list(map(int, ids))
    images = Image.query.filter(Image.trainsample_id.in_(_ids)).all()
    ts_dict = {id: [] for id in _ids}
    for image in images:
        ts_dict[image.trainsample_id].append(image)

    for ts_id, ts_images in ts_dict.items():
        # sort images by their trainsample_position
        ts_images.sort(key=lambda im: im.trainsample_position)

        y = np.zeros(labels_num)
        for image, x in zip(ts_images, xs):
            x.append(imageio.imread(
                os.path.join(dataset.path, image.relative_path)))
        # To consider: retaining 'label' field in Image for speed
        label = int(TrainingSample.query.get(image.trainsample_id).label)
        y[label] = 1.
        ys.append(y)

    return [np.array(x) for x in xs], np.array(ys)


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
