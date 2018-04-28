from .layer_parser import LayerParser


class DropoutParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Dropout'

    @staticmethod
    def parse(id, layer):
        keep_prob = LayerParser.find_node(
                lambda node: node.name.split('/')[-1] == 'keep_prob',
                layer)
        if len(keep_prob) > 0:
            keep_prob = keep_prob[0]
        else:
            keep_prob = LayerParser.find_node(
                    lambda node: node.name.split('/')[-1] == 't',
                    layer)[0]
        keep_prob = keep_prob.attr['value'].tensor.float_val[0]

        return {
                'id': str(id),
                'label': 'dropout',
                'layerType': 'dropout',
                'params': {
                    'keepProb': keep_prob
                    }
                }

    @staticmethod
    def recognize(layer):
        return 'Dropout' in set([name.split('/')[1] for name in layer.keys()])
