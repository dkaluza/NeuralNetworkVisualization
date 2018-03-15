import numpy as np


def read_data(dataset, ids):
    # TODO: read_data
    pass


def shuffle(ids):
    N = len(ids)
    perm = np.arange(N)
    np.random.permutation(perm)
    return ids[perm]


def split_into_batches(ids, batch_size):
    N = len(ids)
    i = 0

    while i + batch_size < N:
        j = i + batch_size
        yield ids[i:j]
        i = j

    yield ids[i:]
