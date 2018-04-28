from .layer_parser import LayerParser


class AddParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Add'

    @staticmethod
    def parse(id, layer):
        return {
                'id': str(id),
                'label': 'add',
                'layerType': 'add',
                'params': {}
                }

    @staticmethod
    def recognize(layer):
        layer_ops = LayerParser._get_ops_set(layer)
        return 'AddN' in layer_ops
