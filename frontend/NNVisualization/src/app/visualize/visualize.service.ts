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
    postprocessingEnabled = false;

    constructor(private restangular: Restangular) {

    }

    getDataset(model_id: number) {
        return this.restangular.one('images/' + model_id.toString()).get();
    }

    getPostprcessing() {
        return this.restangular.one('list_postprocessing').get();
    }

    getAlgorithms() {
        return this.restangular.one('list_algorithms').get();
    }

    getImage(image_id: number) {
        return this.restangular.one('image/' + image_id.toString()).get();
    }

    getImageVis(model_id: number, image_id: number, onImage: boolean) {
        return this.restangular.one('visualize/' + model_id.toString() + '/'
            + this.currentAlgorithm.toString() + '/' + image_id.toString() + '/'
            + this.currentPostprocessing.toString() + '/'
            + (onImage ? 1 : 0).toString()).get();
    }

    doInference(model_id: number, image_id: number) {
        return this.restangular.one('inference/' + model_id.toString() +
            '/' + image_id.toString()).get();
    }

    ngOnInit() {
    }
}
