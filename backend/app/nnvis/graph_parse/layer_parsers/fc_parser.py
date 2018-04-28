from .layer_parser import LayerParser


class FullyConnectedLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Fully connected'

    @staticmethod
    def parse(id, layer):
        weights_name = '{}/weights/read'.format(id)
        weights_node = layer[weights_name]

        activation = LayerParser.get_activation(layer)
        num_outputs = LayerParser._get_shape(weights_node)[-1]
        return {
                'id': str(id),
                'label': 'fc',
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
