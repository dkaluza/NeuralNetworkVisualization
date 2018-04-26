from .layer_parser import LayerParser


class FullyConnectedLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Fully connected'

    @staticmethod
    def parse(id, layer):
        weights_name = '{}/weights/read'.format(id)
        weights = LayerParser.find_node(
                lambda node: node.name == weights_name,
                layer)[0]

        activation = LayerParser.get_activation(layer)
        num_outputs = LayerParser._get_shape(weights)[-1]
        return {
                'id': str(id),
                'label': 'fc {}'.format(id),
                'layerType': 'fc',
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
