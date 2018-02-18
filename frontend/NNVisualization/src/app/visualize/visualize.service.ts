import { Injectable, OnInit } from '@angular/core';
import { Image } from "./image.model";
import { HttpClient } from "@angular/common/http";
import { Restangular } from "ngx-restangular";

@Injectable()
export class VisualizeService implements OnInit {
    image1: Image;
    image2: Image;

    constructor(private httpClient: HttpClient, private restangular: Restangular) {
        // funny default values
        this.image1 = new Image('img1', '/api/static/original/img2.jpg');
        this.image2 = new Image('img2', '/api/static/original/img2.jpg');
    }

    getImages(algorithm: string, id: number) {
        this.restangular.one('visualize/' + algorithm + '/' + id)
            .get().subscribe(response => {
                console.log(response['images']);
                this.image1.imageName = response['images'][0]['imageName'];
                this.image1.imagePath = response['images'][0]['imagePath'];
                this.image2.imageName = response['images'][1]['imageName'];
                this.image2.imagePath = response['images'][1]['imagePath'];
            },
        )
    }

    ngOnInit() {

    }
}
