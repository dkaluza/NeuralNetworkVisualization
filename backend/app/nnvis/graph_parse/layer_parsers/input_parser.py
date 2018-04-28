from .layer_parser import LayerParser


class InputLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Input'

    @staticmethod
    def parse(id, layer):
        input_node = LayerParser.find_node_by_op_type(layer, 'Placeholder')[0]
        input_id = input_node.name.split('/')[-1]
        shape = LayerParser._get_shape(input_node)
        return {
                'id': str(id),
                'label': 'input',
                'layerType': 'input',
                'params': {
                    'inputId': input_id,
                    'shape': shape
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(InputLayerParser,
                          InputLayerParser)._get_ops_set(layer)
        return 'Placeholder' in layer_ops
