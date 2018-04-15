import { Injectable, OnInit } from '@angular/core';
import { ResponseContentType } from '@angular/http';
import { Restangular } from 'ngx-restangular';
import { Algorithm } from './algorithm.model';

@Injectable()
export class VisualizeService implements OnInit {
    algorithmsList: Algorithm[] = [];
    currentAlgorithm = -1;

    constructor(private restangular: Restangular) {
        this.algorithmsList.push(new Algorithm(0, 'VanillaSaliency'));
        this.algorithmsList.push(new Algorithm(1, 'GBP'));
        // this.algorithmsList.push(new Algorithm(2, 'GradCAM'));
    }

    getDataset(model_id: number) {
        return this.restangular.one('images/' + model_id.toString()).get();
    }

    getImage(image_id: number) {
        return this.restangular.one('image/' + image_id.toString()).get();
    }

    getImageVis(model_id: number, alg_id: number, image_id: number) {
        return this.restangular.one('visualize/' + model_id.toString() + '/'
            + this.currentAlgorithm.toString() + '/' + image_id.toString())
            .withHttpConfig({'responseType': 'blob'})
            .get();
    }

    doInference(model_id: number, image_id: number) {
        return this.restangular.one('inference/' + model_id.toString() +
            '/' + image_id.toString()).get();
    }

    ngOnInit() {
    }
}
