from .layer_parser import LayerParser


class ConvLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Conv2D'

    @staticmethod
    def parse(id, layer):
        weights_name = '{}/weights/read'.format(id)
        conv_node = LayerParser.find_node_by_op_type(layer, 'Conv2D')[0]
        weights_node = layer[weights_name]

        weights_shape = LayerParser._get_shape(weights_node)
        activation = LayerParser.get_activation(layer)
        padding = LayerParser.get_padding(conv_node)
        strides = conv_node.attr['strides'].list.i[1:-1]
        num_filters = weights_shape[-1]
        kernel_shape = weights_shape[:-2]

        return {
                'id': str(id),
                'label': 'conv',
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
