import { Injectable, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { Algorithm } from './algorithm.model';
import { Postprocessing } from './postprocessing.model';

@Injectable()
export class VisualizeService implements OnInit {
    algorithmsList: Algorithm[] = [];
    postprocessingList: Postprocessing[] = [];
    currentAlgorithm = -1;
    currentPostprocessing = -1;
    selectedPostprocessing = undefined;
    disabledButton = true;

    constructor(private restangular: Restangular) {

    }

    getDataset(model_id: number) {
        return this.restangular.one('images/' + model_id.toString()).get();
    }

    getPostprcessing(alg_id: number) {
        return this.restangular.one('list_postprocessing/' + alg_id.toString()).get();
    }

    getAlgorithms() {
        return this.restangular.one('list_algorithms').get();
    }

    getImage(image_id: number) {
        return this.restangular.one('image/' + image_id.toString()).get();
    }

    getImageVis(model_id: number, trainsample_id: number, trainsample_position: number, onImage: boolean) {
        return this.restangular.one('visualize/' + model_id.toString() + '/'
            + this.currentAlgorithm.toString() + '/' + trainsample_id.toString() + '/'
            + trainsample_position.toString() + '/' + this.currentPostprocessing.toString() + '/'
            + (onImage ? 1 : 0).toString()).get();
    }

    doInference(model_id: number, trainsample_id: number) {
        return this.restangular.one('inference/' + model_id.toString() +
            '/' + trainsample_id.toString()).get();
    }

    ngOnInit() {
    }
}
