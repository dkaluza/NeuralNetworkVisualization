from .layer_parser import LayerParser


class BatchNormParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'BatchNorm'

    @staticmethod
    def parse(id, layer):
        return {
                'id': str(id),
                'label': 'batch_norm {}'.format(id),
                'layerType': 'batch_norm',
                'params': {
                    'decay': 0.999,
                    'center': True,
                    'scale': False
                    }
                }

    @staticmethod
    def recognize(layer):
        return 'BatchNorm' in set([node.name.split('/')[1] for node in layer])
