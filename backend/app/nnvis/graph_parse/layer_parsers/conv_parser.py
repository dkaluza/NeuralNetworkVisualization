from .layer_parser import LayerParser


class ConvLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Conv2D'

    @staticmethod
    def parse(id, layer):
        weights_name = '{}/weights/read'.format(id)
        conv_node = LayerParser.find_node(
                lambda node: node.op == 'Conv2D',
                layer)[0]
        weights = LayerParser.find_node(
                lambda node: node.name == weights_name,
                layer)[0]

        weights_shape = LayerParser._get_shape(weights)
        activation = LayerParser.get_activation(layer)
        padding = LayerParser.get_padding(conv_node)
        strides = conv_node.attr['strides'].list.i[1:-1]
        num_filters = weights_shape[-1]
        kernel_shape = weights_shape[:-2]

        return {
                'id': str(id),
                'label': 'conv {}'.format(id),
                'layerType': 'conv',
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
