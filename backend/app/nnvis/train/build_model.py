import tensorflow as tf
import os

from app.nnvis.train.layers import build_op


class TFModel:
    def __init__(self, nodes, links):
        self._nodes = {int(node['id']): node for node in nodes}
        self._links = links
        self._ops, self._graph = self._build_model(self._nodes, links)
        self.__rename_logits_and_output()

    def __rename_logits_and_output(self):
        ids = list(map(str, self._nodes.keys()))
        num_outputs = {id: 0 for id in ids}

        for l in self._links:
            num_outputs[l['source']] += 1

        output_ids = list(filter(lambda id: num_outputs[id] == 0, ids))
        output_id = output_ids[0]

        logits_op = self._graph.get_tensor_by_name(
                '{0}/logits:0'.format(output_id))
        output_op = self._ops[output_id]

        with self._graph.as_default():
            logits_op = tf.identity(logits_op, name='logits')
            self._ops[output_id] = tf.identity(output_op, name='output')

    def get_graph(self):
        return self._graph

    def get_ops_map(self):
        return self._ops

    def _build_model(self, nodes, links):
        ids = list(nodes.keys())

        outputs = {id: [] for id in ids}
        inputs = {id: [] for id in ids}
        num_inputs = {id: 0 for id in ids}
        for link in links:
            outputs[int(link['source'])].append(int(link['target']))
            inputs[int(link['target'])].append(int(link['source']))
            num_inputs[int(link['target'])] += 1

        graph = tf.Graph()
        with graph.as_default():
            self._is_training = tf.placeholder(tf.bool, name='is_training')

            map_op = {}
            for id in ids:
                if num_inputs[id] == 0 and id not in map_op:
                    stack = [id]
                    while stack:
                        v = stack.pop()
                        map_op[v] = build_op(nodes[v], map_op,
                                             inputs[v], self._is_training)
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
        ids = list(map(str, self._nodes.keys()))
        num_inputs = {id: 0 for id in ids}

        for l in self._links:
            num_inputs[l['target']] += 1

        input_ids = list(filter(lambda id: num_inputs[id] == 0, ids))
        return [self._ops[id] for id in input_ids]

    def get_logits(self):
        return self._graph.get_tensor_by_name('logits:0')

    def get_output(self):
        return self._graph.get_tensor_by_name('output:0')

    def get_is_training(self):
        return self._is_training

    def save_graph(self, path):
        saver_path = os.path.join(path, 'graph.meta')
        with self._graph.as_default():
            saver = tf.train.Saver()
            saver.export_meta_graph(saver_path)
