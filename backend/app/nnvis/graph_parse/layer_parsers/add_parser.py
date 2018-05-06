from .layer_parser import LayerParser


class AddParser(LayerParser):

    def __init__(self):
        super().__init__('Add')

    @staticmethod
    def parse(id, layer, nodes):
        return {
                'id': str(id),
                'label': 'add',
                'layerType': 'add',
                'shareWeightsFrom': 0,
                'params': {}
                }

    @staticmethod
    def recognize(layer):
        layer_ops = LayerParser._get_ops_set(layer)
        return 'AddN' in layer_ops
