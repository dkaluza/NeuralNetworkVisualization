from .layer_parser import UnknownLayerError
from .input_parser import InputLayerParser
from .fc_parser import FullyConnectedLayerParser
from .conv_parser import ConvLayerParser
from .pool_parser import PoolLayerParser
from .softmax_parser import SoftmaxLayerParser
from .add_parser import AddParser
from .concat_parser import ConcatParser
from .dropout_parser import DropoutParser
from .batch_norm_parser import BatchNormParser


LAYER_PARSERS = [
        InputLayerParser(),
        FullyConnectedLayerParser(),
        ConvLayerParser(),
        PoolLayerParser(),
        SoftmaxLayerParser(),
        AddParser(),
        ConcatParser(),
        DropoutParser(),
        BatchNormParser()
        ]


def _search_for_layer_parser(layer):
    for layer_parser in LAYER_PARSERS:
        if layer_parser.recognize(layer):
            return layer_parser
    raise UnknownLayerError()


def get_node(id, layer, nodes):
    parser = _search_for_layer_parser(layer)
    return parser.parse(id, layer, nodes)


def get_type(layer):
    parser = _search_for_layer_parser(layer)
    return parser.name(layer)
