import tensorflow as tf

from app.vis_tools.algorithms.saliency import SaliencyMask
from app.vis_tools.postprocessing.Grayscale import Grayscale
from app.vis_tools.postprocessing.RGB import RGB


class GuidedBackprop(SaliencyMask):
    postprocessings = {
        0: Grayscale,
        1: RGB,
    }

    GuidedReluRegistered = False

    def __init__(self, graph, session, y, xs):
        super(GuidedBackprop, self).__init__(graph, session, y, xs)

        self.xs = xs

        if GuidedBackprop.GuidedReluRegistered is False:
            #### Acknowledgement to Chris Olah ####
            @tf.RegisterGradient("GuidedRelu")
            def _GuidedReluGrad(op, grad):
                gate_g = tf.cast(grad > 0, "float32")
                gate_y = tf.cast(op.outputs[0] > 0, "float32")
                return gate_y * gate_g * grad
        GuidedBackprop.GuidedReluRegistered = True

        with graph.as_default():
            saver = tf.train.Saver()
            saver.save(session, '/tmp/guided_backprop_ckpt')

        graph_def = graph.as_graph_def()

        self.guided_graph = tf.Graph()
        with self.guided_graph.as_default():
            self.guided_sess = tf.Session(graph=self.guided_graph)
            with self.guided_graph.gradient_override_map({'Relu': 'GuidedRelu'}):
                # Import the graph def, and all the variables.
                tf.import_graph_def(graph_def, name='')
                saver.restore(self.guided_sess, '/tmp/guided_backprop_ckpt')

                imported_y = self.guided_graph.get_tensor_by_name(y.name)
                imported_xs = [
                    self.guided_graph.get_tensor_by_name(x.name)
                    for x in self.xs
                ]

                self.guided_grads_nodes = [
                    tf.gradients(imported_y, imported_x)[0]
                    for imported_x in imported_xs
                ]

    def GetMask(self, x_values, feed_dict={}):
        """Returns a GuidedBackprop mask."""
        with self.guided_graph.as_default():
            guided_feed_dict = {}
            for tensor in feed_dict:
                guided_feed_dict[tensor.name] = feed_dict[tensor]
            for i, x_value in enumerate(x_values):
                guided_feed_dict[self.xs[i].name] = x_value

        results = self.guided_sess.run(
            self.guided_grads_nodes,
            feed_dict=guided_feed_dict
        )

        return [result[0] for result in results]

    @staticmethod
    def name():
        return "guided backprop"
