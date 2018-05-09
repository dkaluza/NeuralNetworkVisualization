from flask_restful import Api

from app import nnvis
from app.nnvis.rests.architecture import (ArchitectureTask,
                                          UploadNewArchitecture,
                                          ListAllArchitectures,
                                          ExportArchitecture,
                                          ImportArchitecture)

from app.nnvis.rests.model import (ModelTask,
                                   UploadNewModel,
                                   ListAllModels,
                                   ExportModel,
                                   ImportModel)

from app.nnvis.rests.dataset import (DatasetTask,
                                     UploadNewDataset,
                                     ListAllDatasets)

from app.nnvis.rests.train import (TrainNewModel, TrainModel,
                                   ListLosses, ListOptimizers,
                                   handle_currently_training_connection,
                                   handle_list_trained_models_connection)
from app.nnvis.rests.user import AuthenticationTask
from app.nnvis.rests.visualize import (Inference, Visualize, Images,
                                       ImageList, Algorithms, Postprocessing)

api = Api(nnvis)

api.add_resource(ArchitectureTask, 'arch/<int:arch_id>')
api.add_resource(UploadNewArchitecture, 'upload_arch')
api.add_resource(ListAllArchitectures, 'list_archs')
api.add_resource(ImportArchitecture, 'import_arch')
api.add_resource(ExportArchitecture, 'export_arch/<int:arch_id>')

api.add_resource(ModelTask, 'model/<int:model_id>')
api.add_resource(UploadNewModel, 'upload_model/<int:arch_id>')
api.add_resource(ListAllModels, 'list_models/<int:arch_id>')
api.add_resource(ImportModel, 'import_model')
api.add_resource(ExportModel, 'export_model/<int:model_id>')

api.add_resource(DatasetTask, 'dataset/<int:dataset_id>')
api.add_resource(UploadNewDataset, 'upload_dataset')
api.add_resource(ListAllDatasets, 'list_datasets')

api.add_resource(Inference, 'inference/<int:model_id>/<int:trainsample_id>')
api.add_resource(Visualize, 'visualize/<int:model_id>/<int:alg_id>/<int:trainsample_id>/<int:trainsample_position>/<int:postprocessing_id>/<int:on_image>')
api.add_resource(ImageList, 'images/<int:model_id>')
api.add_resource(Images, 'image/<int:image_id>')
api.add_resource(Algorithms, 'list_algorithms')
api.add_resource(Postprocessing, 'list_postprocessing/<int:alg_id>')

api.add_resource(TrainNewModel, 'train_new_model/<int:arch_id>')
api.add_resource(TrainModel, 'train_model/<int:model_id>')

api.add_resource(AuthenticationTask, 'authenticate')

api.add_resource(ListLosses, 'list_losses')
api.add_resource(ListOptimizers, 'list_optimizers')


def register_socketsio_events(socketio):
    socketio.on_event('connect', handle_currently_training_connection,
                      namespace='/currently_training')
    socketio.on_event('connect', handle_list_trained_models_connection,
                      namespace='/list_trained_models')
