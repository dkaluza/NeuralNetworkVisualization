class LayerParser():
    @staticmethod
    def _get_ops_set(layer):
        return set([node.op for _, node in layer.items()])

    @staticmethod
    def _get_shape(node):
        # tensorflow black magic
        return [dim.size
                for dim in node.attr['_output_shapes'].list.shape[0].dim]

    @staticmethod
    def find_node(pred, layer):
        return list([node for _, node in layer.items() if pred(node)])

    @staticmethod
    def find_node_by_op_type(layer, op_type):
        return LayerParser.find_node(
                    lambda node: node.op == op_type,
                    layer)

    @staticmethod
    def get_activation(layer):
        activations = {
                'Relu': 'Relu',
                'Sigmoid': 'Sigmoid'
                }
        layer_ops = LayerParser._get_ops_set(layer)
        for act_name, act_op in activations.items():
            if act_op in layer_ops:
                return act_name
        return 'None'

    @staticmethod
    def get_padding(node):
        return node.attr['padding'].s.decode('utf-8').title()

    @staticmethod
    def layer_name():
        raise NotImplementedError()

    @staticmethod
    def parse(id, layer, nodes):
        raise NotImplementedError()

    @staticmethod
    def recognize(layer):
        raise NotImplementedError()


class UnknownLayerError(Exception):
    pass
