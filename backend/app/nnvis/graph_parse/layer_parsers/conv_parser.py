from .layer_parser import LayerParser


class ConvLayerParser(LayerParser):

    def __init__(self):
        super().__init__('Conv2D')

    @staticmethod
    def parse(id, layer, nodes):
        conv_node = LayerParser.find_node_by_op_type(layer, 'Conv2D')[0]
        weights_name = conv_node.input[-1]
        weights_node = list(filter(
            lambda node: node.name == weights_name, nodes))[0]

        weights_shape = LayerParser._get_shape(weights_node)
        activation = LayerParser.get_activation(layer)
        padding = LayerParser.get_padding(conv_node)
        strides = conv_node.attr['strides'].list.i[1:-1]
        num_filters = weights_shape[-1]
        kernel_shape = weights_shape[:-2]
        share_from = int(conv_node.input[-1].split('/')[0])
        share_from = share_from if share_from != id else 0

        return {
                'id': str(id),
                'label': 'conv',
                'layerType': 'conv',
                'shareWeightsFrom': share_from,
                'params': {
                        'numFilters': num_filters,
                        'kernelShape': kernel_shape,
                        'strides': strides,
                        'padding': padding,
                        'activation': activation
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(ConvLayerParser,
                          ConvLayerParser)._get_ops_set(layer)
        return layer_ops.issuperset(set(['Conv2D']))
