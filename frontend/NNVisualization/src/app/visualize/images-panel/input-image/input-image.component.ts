import {Component, OnInit} from '@angular/core';
import {Image} from "../../image.model";
import {VisualizeService} from "../../visualize.service";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
    selector: 'app-input-image',
    templateUrl: './input-image.component.html',
    styleUrls: ['./input-image.component.css'],
})
export class InputImageComponent implements OnInit {
    image: Image;
    currentAlgorithm: string;
    currentImageId: number;
    imagesList: Image[] = [];
    // image1: Image;
    // image2: Image;

    constructor(public visualizeService: VisualizeService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        this.image = this.visualizeService.image1;
        this.currentAlgorithm = this.route.snapshot.params['algorithm'];
        this.currentImageId = this.route.snapshot.params['image_id'];
        this.route.params
            .subscribe(
                (params: Params) => {
                    this.currentAlgorithm = params['algorithm'];
                    this.currentImageId = params['image_id'];
                }
            );

        // this.imagesList.push(new Image(0, 'img1', '/api/static/original/img2.jpg'));
        // this.imagesList.push(new Image(0, 'img1', '/api/static/original/img2.jpg'));
        // console.log(this.imagesList);
    }

    onGetNextImage() {
        this.currentImageId++;
        this.currentImageId %= 3; // temporary workaround
        this.router.navigate(['/visualize', this.currentAlgorithm, this.currentImageId]);
        this.visualizeService.getImages(this.currentAlgorithm, this.currentImageId);
    }

    onGetPreviousImage() {
        this.currentImageId += 2; // same as -= 1 in mod 3
        this.currentImageId %= 3; // temporary workaround
        this.router.navigate(['/visualize', this.currentAlgorithm, this.currentImageId]);
        this.visualizeService.getImages(this.currentAlgorithm, this.currentImageId);
    }
}
