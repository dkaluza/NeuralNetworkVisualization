from .layer_parser import LayerParser


class DropoutParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Dropout'

    @staticmethod
    def parse(id, layer):
        return {
                'id': str(id),
                'label': 'dropout {}'.format(id),
                'layerType': 'dropout',
                'params': {
                    'keepProb': 0.5
                    }
                }

    @staticmethod
    def recognize(layer):
        return 'Dropout' in set([node.name.split('/')[1] for node in layer])
