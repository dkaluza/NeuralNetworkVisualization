import tensorflow as tf
from app.nnvis.train.layers import build_op


def build_model(name_scope, nodes, links):
    ids = [int(node['id']) for node in nodes]
    nodes = {int(node['id']): node for node in nodes}

    outputs = {id: [] for id in ids}
    inputs = {id: [] for id in ids}
    num_inputs = {id: 0 for id in ids}
    for link in links:
        outputs[int(link['source'])].append(int(link['target']))
        inputs[int(link['target'])].append(int(link['source']))
        num_inputs[int(link['target'])] += 1

    graph = tf.Graph()
    with graph.as_default() as g:
        map_op = {}
        for id in ids:
            if num_inputs[id] == 0 and id not in map_op:
                stack = [id]
                while stack:
                    v = stack.pop()
                    map_op[v] = build_op(nodes[v], map_op, inputs[v])
                    for u in outputs[v]:
                        num_inputs[u] -= 1
                        if num_inputs[u] == 0:
                            stack.append(u)

    for v in ids:
        assert(num_inputs[v] == 0)

    ret = {}
    for k, v in map_op.items():
        ret[str(k)] = v

    return ret, graph


def get_input_ids(nodes, links):
    ids = [node['id'] for node in nodes]
    num_inputs = {id: 0 for id in ids}

    for l in links:
        num_inputs[l['target']] += 1

    return list(filter(lambda id: num_inputs[id] == 0, ids))


def get_output_ids(nodes, links):
    ids = [node['id'] for node in nodes]
    num_outputs = {id: 0 for id in ids}

    for l in links:
        num_outputs[l['source']] += 1

    return list(filter(lambda id: num_outputs[id] == 0, ids))
