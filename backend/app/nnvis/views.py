from flask import Blueprint
from flask_restful import Api

from app.nnvis.rests.architecture import (ArchitectureTask,
                                          UploadNewArchitecture,
                                          ListAllArchitectures)
from app.nnvis.rests.model import (ModelTask,
                                   UploadNewModel,
                                   ListAllModels)
from app.nnvis.rests.dataset import (DatasetTask,
                                     UploadNewDataset,
                                     ListAllDatasets)
from app.nnvis.rests.visualize import (Inference, Visualize, Images, ImageList, Algorithms)
from app.nnvis.rests.train import (TrainNewModel, TrainModel)
from app.nnvis.rests.user import AuthenticationTask

nnvis = Blueprint('nnvis', __name__)
api = Api(nnvis)

api.add_resource(ArchitectureTask, 'arch/<int:arch_id>')
api.add_resource(UploadNewArchitecture, 'upload_arch')
api.add_resource(ListAllArchitectures, 'list_archs')

api.add_resource(ModelTask, 'model/<int:model_id>')
api.add_resource(UploadNewModel, 'upload_model/<int:arch_id>')
api.add_resource(ListAllModels, 'list_models/<int:arch_id>')

api.add_resource(DatasetTask, 'dataset/<int:dataset_id>')
api.add_resource(UploadNewDataset, 'upload_dataset')
api.add_resource(ListAllDatasets, 'list_datasets')

api.add_resource(Inference, 'inference/<int:model_id>')
api.add_resource(Visualize, 'visualize/<int:model_id>/<int:alg_id>/<int:image_id>')
api.add_resource(ImageList, 'images/<int:dataset_id>')
api.add_resource(Images, 'image/<int:image_id>')
api.add_resource(Algorithms, 'list_algorithms')

api.add_resource(TrainNewModel,
                 'train_new_model/<int:arch_id>/<int:dataset_id>')
api.add_resource(TrainModel, 'train_model/<int:model_id>/<int:dataset_id>')

api.add_resource(AuthenticationTask, 'authenticate')
