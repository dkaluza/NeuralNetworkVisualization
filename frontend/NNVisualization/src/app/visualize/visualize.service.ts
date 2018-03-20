import {Injectable, OnInit} from '@angular/core';
import {Image} from "./image.model";
import {HttpClient} from "@angular/common/http";
import {Restangular} from "ngx-restangular";

@Injectable()
export class VisualizeService implements OnInit {
    // currentImageId = 0;
    // image1: Image;
    // image2: Image;
    // imagesList: Image[];


    constructor(private httpClient: HttpClient, private restangular: Restangular) {

    }

    getDataset(dataset_id: number) {
        return this.restangular.one('images/' + dataset_id.toString()).get();
    }

    getImage(image_id: number) {
        return this.restangular.one('image/' + image_id.toString()).get();
    }

    getImageVis(model_id: number, alg_id: number, image_id: number) {
        return this.restangular.one('visualize/' + model_id.toString() + '/'
            + alg_id.toString() + '/' + image_id.toString()).get();
    }


    ngOnInit() {
    }
}
