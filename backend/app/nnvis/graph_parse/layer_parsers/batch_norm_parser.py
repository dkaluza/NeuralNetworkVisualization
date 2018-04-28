from .layer_parser import LayerParser


class BatchNormParser(LayerParser):
    @staticmethod
    def layer_name():
        return 'BatchNorm'

    @staticmethod
    def check_center_and_scale(layer):
        '''
        center is True iff there exists beta variable
        scale is True iff there exists gamma variable
        '''
        bn_op = LayerParser.find_node_by_op_type(layer, 'FusedBatchNorm')[0]
        scale_op_name = bn_op.input[1].split(':')[0]
        center_op_name = bn_op.input[2].split(':')[0]

        if scale_op_name.split('/')[-1] == 'read':
            scale = True
        else:
            scale_op = layer[scale_op_name]
            if scale_op.op == 'Const':
                scale = False
            else:
                scale = scale_op.input[0].split('/')[-1] == 'read'

        if center_op_name.split('/')[-1] == 'read':
            center = True
        else:
            center_op = layer[center_op_name]
            if center_op.op == 'Const':
                center = False
            else:
                center = center_op.input[0].split('/')[-1] == 'read'

        return center, scale

    @staticmethod
    def get_decay(id, layer):
        # tensorflow black magic - works in tf 1.8
        op = LayerParser.find_node_by_op_type(layer, 'AssignSub')[0]
        while op.op != 'Const':
            op = layer[op.input[-1]]
        decay = op.attr['value'].tensor.float_val[0]
        return decay

    @staticmethod
    def parse(id, layer, nodes):
        center, scale = BatchNormParser.check_center_and_scale(layer)
        decay = BatchNormParser.get_decay(id, layer)
        return {
                'id': str(id),
                'label': 'batch_norm',
                'layerType': 'batch_norm',
                'shareWeightsFrom': 0,
                'params': {
                    'decay': decay,
                    'center': center,
                    'scale': scale
                    }
                }

    @staticmethod
    def recognize(layer):
        types = [name.split('/')[1] for name in layer.keys()]
        return 'BatchNorm' in set(types)
