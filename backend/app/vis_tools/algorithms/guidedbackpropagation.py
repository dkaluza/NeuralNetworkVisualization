from app.vis_tools.algorithms.vanillasaliency import SaliencyMask
import tensorflow as tf
import numpy as np

class GuidedBackprop(SaliencyMask):
  """A SaliencyMask class that computes saliency masks with GuidedBackProp.

  This implementation copies the TensorFlow graph to a new graph with the ReLU
  gradient overwritten as in the paper:
  https://arxiv.org/abs/1412.6806

  Thanks to Chris Olah for generously sharing his implementation of the ReLU
  backprop.
  """

  GuidedReluRegistered = False

  def __init__(self, graph, session, y, x):
    """Constructs a GuidedBackprop SaliencyMask."""
    super(GuidedBackprop, self).__init__(graph, session, y, x)

    self.x = x

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
      self.guided_sess = tf.Session(graph = self.guided_graph)
      with self.guided_graph.gradient_override_map({'Relu': 'GuidedRelu'}):
        # Import the graph def, and all the variables.
        tf.import_graph_def(graph_def, name='')
        saver.restore(self.guided_sess, '/tmp/guided_backprop_ckpt')

        imported_y = self.guided_graph.get_tensor_by_name(y.name)
        imported_x = self.guided_graph.get_tensor_by_name(x.name)

        self.guided_grads_node = tf.gradients(imported_y, imported_x)[0]

  def GetMask(self, x_value, feed_dict = {}):
    """Returns a GuidedBackprop mask."""
    with self.guided_graph.as_default():
      # Move all the feed dict tensor keys to refer to the same tensor on the
      # new graph.
      guided_feed_dict = {}
      for tensor in feed_dict:
        guided_feed_dict[tensor.name] = feed_dict[tensor]
      guided_feed_dict[self.x.name] = [x_value]

    return self.guided_sess.run(
        self.guided_grads_node, feed_dict = guided_feed_dict)[0]

  def __str__(self):
    return '_guided_backpropagation'

class SmoothedGuidedBackprop:
  """A SaliencyMask class that computes saliency masks with GuidedBackProp.

  This implementation copies the TensorFlow graph to a new graph with the ReLU
  gradient overwritten as in the paper:
  https://arxiv.org/abs/1412.6806

  Thanks to Chris Olah for generously sharing his implementation of the ReLU
  backprop.
  """

  GuidedReluRegistered = False

  def __init__(self, graph, session, y, x):
    """Constructs a GuidedBackprop SaliencyMask."""
    size = 1
    for shape in y.shape:
      size *= shape
    assert size == 1

    self.graph = graph
    self.session = session
    self.y = y
    self.x = x

    self.x = x

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
      self.guided_sess = tf.Session(graph = self.guided_graph)
      with self.guided_graph.gradient_override_map({'Relu': 'GuidedRelu'}):
        # Import the graph def, and all the variables.
        tf.import_graph_def(graph_def, name='')
        saver.restore(self.guided_sess, '/tmp/guided_backprop_ckpt')

        imported_y = self.guided_graph.get_tensor_by_name(y.name)
        imported_x = self.guided_graph.get_tensor_by_name(x.name)

        self.guided_grads_node = tf.gradients(imported_y, imported_x)[0]

  def GetMask(self, x_value, feed_dict = {}):
    """Returns a GuidedBackprop mask."""
    with self.guided_graph.as_default():
      # Move all the feed dict tensor keys to refer to the same tensor on the
      # new graph.
      guided_feed_dict = {}
      for tensor in feed_dict:
        guided_feed_dict[tensor.name] = feed_dict[tensor]
      guided_feed_dict[self.x.name] = [x_value]

    return self.guided_sess.run(
        self.guided_grads_node, feed_dict = guided_feed_dict)[0]

  def GetSmoothedMask(
      self, x_value, feed_dict={}, stdev_spread=.15, nsamples=25,
      magnitude=True, **kwargs):
    """Returns a mask that is smoothed with the SmoothGrad method.

    Args:
      x_value: Input value, not batched.
      feed_dict: (Optional) feed dictionary to pass to the session.run call.
      stdev_spread: Amount of noise to add to the input, as fraction of the
                    total spread (x_max - x_min). Defaults to 15%.
      nsamples: Number of samples to average across to get the smooth gradient.
      magnitude: If true, computes the sum of squares of gradients instead of
                 just the sum. Defaults to true.
    """
    stdev = stdev_spread * (np.max(x_value) - np.min(x_value))

    total_gradients = np.zeros_like(x_value)
    for i in range(nsamples):
      noise = np.random.normal(0, stdev, x_value.shape)
      x_plus_noise = x_value + noise
      grad = self.GetMask(x_plus_noise, feed_dict, **kwargs)
      if magnitude:
        total_gradients += (grad * grad)
      else:
        total_gradients += grad

    return total_gradients / nsamples

