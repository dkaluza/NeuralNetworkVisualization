import tensorflow as tf
from .layer_parsers.layer_parser import LayerParser
from .layer_parsers.utils import get_node, UnknownLayerError


class IncorrectMetaGraph(Exception):
    pass


class GraphParser():
    def __init__(self, meta_file):
        self._meta_def = tf.MetaGraphDef()
        with open(meta_file, 'rb') as fd:
            self._meta_def.ParseFromString(fd.read())

    def _inputs(self, nodes):
        return list(filter(
                lambda node: node.name.split('/')[0] == 'input',
                nodes))

    def _layers(self, nodes):
        layers = dict()
        # find ops with starting from <number>/
        for node in nodes:
            try:
                node_layer_id = int(node.name.split('/')[0])
            except:
                # node name doesn't start with number
                continue

            if node_layer_id in layers:
                layers[node_layer_id][node.name] = node
            else:
                layers[node_layer_id] = {node.name: node}
        return layers

    def _check_inputs(self, node, name):
        return len(list(filter(
            lambda _input: _input == name,
            node.input))) > 0

    def parse(self):
        nodes = self._meta_def.graph_def.node

        graph = {
                'nodes': [],
                'links': []
                }
        inputs = self._inputs(nodes)
        layers = self._layers(nodes)

        input_to_layer = dict()
        for input_node in inputs:
            for output_id in layers.keys():
                for name, node in layers[output_id].items():
                    if name.split('/')[-1] == 'logits':
                        if self._check_inputs(node, input_node.name):
                            input_to_layer[input_node.name] = output_id
                            break
        for input_node in inputs:
            for output_id in layers.keys():
                for name, node in layers[output_id].items():
                    if name.split('/')[-1] != 'logits':
                        if self._check_inputs(node, input_node.name):
                            graph['links'].append({
                                'source': str(input_to_layer[input_node.name]),
                                'target': str(output_id)
                                })
                            layers[input_to_layer[input_node.name]][input_node.name] = input_node
                            break

        for layer_id in layers.keys():
            for output_id, output in layers.items():
                if layer_id == output_id:
                    continue
                ns = LayerParser.find_node(
                        lambda node: any(_input.split('/')[0] == str(layer_id) for _input in node.input),
                        output)
                if len(ns) > 0:
                    graph['links'].append({
                        'source': str(layer_id),
                        'target': str(output_id)
                        })

        for layer_id, layer in layers.items():
            try:
                layer_node = get_node(layer_id, layer, nodes)
                graph['nodes'].append(layer_node)
            except UnknownLayerError:
                print('Unknown layer {}'.format(layer_id))
                raise IncorrectMetaGraph()

        return graph
