from .layer_parser import LayerParser


class SoftmaxLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Softmax'

    @staticmethod
    def parse(id, layer):
        return {
                'id': str(id),
                'label': 'softmax {}'.format(id),
                'layerType': 'softmax',
                'params': {
                    'axis': -1
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(SoftmaxLayerParser,
                          SoftmaxLayerParser)._get_ops_set(layer)
        return 'Softmax' in layer_ops
