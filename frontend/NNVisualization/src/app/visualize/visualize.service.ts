import {Injectable, OnInit} from '@angular/core';
import {Image} from "./image.model";
import {HttpClient} from "@angular/common/http";
import {Restangular} from "ngx-restangular";

@Injectable()
export class VisualizeService implements OnInit {
    currentImageId: number;
    image1: Image;
    image2: Image;
    imagesList: Image[] = [];


    constructor(private httpClient: HttpClient, private restangular: Restangular) {
        // funny default values
        this.image1 = new Image(0, 'img1', '/api/static/original/img2.jpg');
        this.image2 = new Image(0, 'img2', '/api/static/original/img2.jpg');
        this.imagesList.push(this.image1, this.image2);
    }

    getImages(algorithm: string, id: number) {
        // this.restangular.all('visualize').one(algorithm, id)
        //     .get().subscribe(response => {
        //         console.log(response['images']);
        //         this.image1.imageName = response['images'][0]['imageName'];
        //         this.image1.imagePath = response['images'][0]['imagePath'];
        //         this.image2.imageName = response['images'][1]['imageName'];
        //         this.image2.imagePath = response['images'][1]['imagePath'];
        //     },
        // );
    }

    getDataset(datasetId: number) {
        // todo
        this.imagesList = [];
    }

    ngOnInit() {
    }
}
