import tensorflow as tf
import os

from app.nnvis.train.layers import build_op


class TFModel:
    def __init__(self, nodes=None, links=None, meta_file=None):
        if meta_file is None:
            self._nodes = {int(node['id']): node for node in nodes}
            self._links = links
            self._graph, self._ops = self._build_model(self._nodes, links)
            self.__rename_logits_and_output()
        else:
            self._graph = self.__load_from_meta_graph(meta_file)
        self._inputs = self.__find_input_ops()
        self._is_training = self.__find_is_training()

    def __load_from_meta_graph(self, meta_def):
        graph = tf.Graph()
        with graph.as_default():
            tf.train.import_meta_graph(meta_def)
        return graph

    def __find_input_ops(self):
        input_names = []
        input_num = 1
        while True:
            input_name = 'input/{0}:0'.format(input_num)
            try:
                # just check if this input is in graph
                self._graph.get_tensor_by_name(input_name)
                input_names.append(input_name)
                input_num += 1
            except KeyError:
                break
        return input_names

    def __find_is_training(self):
        try:
            op = self._graph.get_tensor_by_name('is_training:0')
        except KeyError:
            # create mockup is_training op
            with self._graph.as_default():
                op = tf.placeholder(tf.bool, name='is_training')

        return op

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
            is_training = tf.placeholder(tf.bool, name='is_training')

            map_op = {}
            for id in ids:
                if num_inputs[id] == 0 and id not in map_op:
                    stack = [id]
                    while stack:
                        v = stack.pop()
                        map_op[v] = build_op(nodes[v], map_op,
                                             inputs[v], is_training)
                        for u in outputs[v]:
                            num_inputs[u] -= 1
                            if num_inputs[u] == 0:
                                stack.append(u)

        for v in ids:
            assert(num_inputs[v] == 0)

        ret = {}
        for k, v in map_op.items():
            ret[str(k)] = v

        return graph, ret

    def get_inputs(self):
        ops = [self._graph.get_tensor_by_name(name)
               for name in self._inputs]
        return ops

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
