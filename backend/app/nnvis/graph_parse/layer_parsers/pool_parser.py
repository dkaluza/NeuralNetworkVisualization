from .layer_parser import LayerParser


class PoolLayerParser(LayerParser):

    def __init__(self):
        super().__init__('Pool')

    @staticmethod
    def get_pool(layer):
        pools = {
                'Max': 'MaxPool',
                'Average': 'AvgPool'
                }
        layer_ops = LayerParser._get_ops_set(layer)
        for pool_name, pool_op in pools.items():
            if pool_op in layer_ops:
                return pool_name, pool_op
        raise Exception('no pool')

    @staticmethod
    def parse(id, layer, nodes):
        pool, pool_op = PoolLayerParser.get_pool(layer)
        pool_node = LayerParser.find_node_by_op_type(layer, pool_op)[0]

        kernel_shape = pool_node.attr['ksize'].list.i[1:-1]
        strides = pool_node.attr['strides'].list.i[1:-1]
        padding = LayerParser.get_padding(pool_node)

        return {
                'id': str(id),
                'label': 'pool',
                'layerType': 'pool',
                'shareWeightsFrom': 0,
                'params': {
                        'pool': pool,
                        'kernelShape': kernel_shape,
                        'strides': strides,
                        'padding': padding
                    }
                }

    @staticmethod
    def recognize(layer):
        layer_ops = super(PoolLayerParser,
                          PoolLayerParser)._get_ops_set(layer)
        return 'MaxPool' in layer_ops or 'AvgPool' in layer_ops
