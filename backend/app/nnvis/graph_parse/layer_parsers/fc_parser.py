from .layer_parser import LayerParser


class FullyConnectedLayerParser(LayerParser):

    def __init__(self):
        super().__init__('Fully connected')

    @staticmethod
    def parse(id, layer, nodes):
        fc_node = LayerParser.find_node_by_op_type(layer, 'MatMul')[0]
        weights_name = fc_node.input[-1]
        weights_node = list(filter(
            lambda node: node.name == weights_name, nodes))[0]

        activation = LayerParser.get_activation(layer)
        num_outputs = LayerParser._get_shape(weights_node)[-1]
        share_from = int(fc_node.input[-1].split('/')[0])
        share_from = share_from if share_from != id else 0
        return {
                'id': str(id),
                'label': 'fc',
                'layerType': 'fc',
                'shareWeightsFrom': share_from,
                'params': {
                        'numOutputs': num_outputs,
                        'activation': activation
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(FullyConnectedLayerParser,
                          FullyConnectedLayerParser)._get_ops_set(layer)
        if not layer_ops.issuperset(['MatMul', 'BiasAdd']):
            return False
        if 'Conv2D' in layer_ops:
            return False
        return True
