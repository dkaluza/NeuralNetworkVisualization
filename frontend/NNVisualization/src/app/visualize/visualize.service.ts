import { Injectable, OnInit } from '@angular/core';
import { ResponseContentType } from '@angular/http';
import { Restangular } from 'ngx-restangular';
import { Algorithm } from './algorithm.model';

@Injectable()
export class VisualizeService implements OnInit {
    algorithmsList: Algorithm[] = [];
    currentAlgorithm = -1;

    constructor(private restangular: Restangular) {
        this.restangular.one('list_algorithms').get().subscribe(response => {
            Object.keys(response['algs']).forEach(key => {
                this.algorithmsList.push(new Algorithm(response['algs'][key], key));
            });
        });
    }

    getDataset(model_id: number) {
        return this.restangular.one('images/' + model_id.toString()).get();
    }

    getImage(image_id: number) {
        return this.restangular.one('image/' + image_id.toString()).get();
    }

    getImageVis(model_id: number, alg_id: number, image_id: number) {
        return this.restangular.one('visualize/' + model_id.toString() + '/'
            + this.currentAlgorithm.toString() + '/' + image_id.toString()).get();
    }

    doInference(model_id: number, image_id: number) {
        return this.restangular.one('inference/' + model_id.toString() +
            '/' + image_id.toString()).get();
    }

    ngOnInit() {
    }
}
