from .layer_parser import LayerParser


class ConcatParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Concat'

    @staticmethod
    def parse(id, layer):
        axis_node = LayerParser.find_node(
                lambda node: node.name.split('/')[-1] == 'axis',
                layer)[0]
        axis = axis_node.attr['value'].tensor.int_val[0]
        return {
                'id': str(id),
                'label': 'concat {}'.format(id),
                'layerType': 'concat',
                'params': {
                    'axis': axis
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = LayerParser._get_ops_set(layer)
        return 'ConcatV2' in layer_ops
