from .layer_parser import LayerParser


class SoftmaxLayerParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'Softmax'

    @staticmethod
    def parse(id, layer, nodes):
        axis_op = layer.get('{}/concat/axis'.format(id))
        if axis_op is None:
            axis = -1
        else:
            axis = axis_op.attr['value'].tensor.int_val[0]
        return {
                'id': str(id),
                'label': 'softmax',
                'layerType': 'softmax',
                'shareWeightsFrom': 0,
                'params': {
                    'axis': axis
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(SoftmaxLayerParser,
                          SoftmaxLayerParser)._get_ops_set(layer)
        return 'Softmax' in layer_ops
