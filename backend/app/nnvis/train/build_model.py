import tensorflow as tf
from app.nnvis.train.layers import build_op


class TFModel:
    def __init__(self, nodes, links):
        self._nodes = nodes
        self._links = links
        self._ops, self._graph = self._build_model(nodes, links)

    def get_graph(self):
        return self._graph

    def get_ops_map(self):
        return self._ops

    def _build_model(self, nodes, links):
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
        with graph.as_default():
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

    def get_inputs(self):
        ids = [node['id'] for node in self._nodes]
        num_inputs = {id: 0 for id in ids}

        for l in self._links:
            num_inputs[l['target']] += 1

        input_ids = list(filter(lambda id: num_inputs[id] == 0, ids))
        return [self._ops[id] for id in input_ids]

    def get_logits(self):
        ids = [node['id'] for node in self._nodes]
        num_outputs = {id: 0 for id in ids}

        for l in self._links:
            num_outputs[l['source']] += 1

        logits_ids = list(filter(lambda id: num_outputs[id] == 0, ids))
        return [self._ops[id] for id in logits_ids]
