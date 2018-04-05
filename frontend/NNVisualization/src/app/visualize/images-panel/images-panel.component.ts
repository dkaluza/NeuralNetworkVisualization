import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Image } from '../image.model';
import { MatTableDataSource } from '@angular/material';
import { VisualizeService } from '../visualize.service';
import { SelectedArchitectureService } from '../../selected-architecture/selected-architecture.service';


@Component({
    selector: 'app-images-panel',
    templateUrl: './images-panel.component.html',
    styleUrls: ['./images-panel.component.css']
})
export class ImagesPanelComponent implements OnInit {

    placeholder_img = 'api/static/placeholder2.jpg';
    currentImage: Image; // = new Image(-1, -1, '', '', -1);
    currentImageVis = '';
    currentAlgorithm = 0;
    currentImageId = 0;
    currentImageName: any;
    imagesList: Image[] = [];

    displayedColumns = ['class_number', 'class_name', 'score'];
    dataSource = new MatTableDataSource();

    constructor(private visualizeService: VisualizeService,
                private selectedService: SelectedArchitectureService,
                private cd: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.onGetDataset();
    }

    onGetNextImage() {
        let index = this.imagesList.findIndex((img) => {
            return img.imageId === this.currentImage.imageId;
        });
        index++;
        if (index >= this.imagesList.length) {
            index %= this.imagesList.length;
        }
        this.currentImage = this.imagesList[index];
        this.currentImageName = this.currentImage.imageName;
        console.log(this.currentImageName);
        this.onGetImage(this.currentImage);
    }

    onGetPreviousImage() {
        let index = this.imagesList.findIndex((img) => {
            return img.imageId === this.currentImage.imageId;
        });
        index--;
        if (index < 0) {
            index += this.imagesList.length;
        }
        this.currentImage = this.imagesList[index];
        this.currentImageName = this.currentImage.imageName;
        console.log(this.currentImageName);
        this.onGetImage(this.currentImage);
    }

    onGetDataset() {
        const model = this.selectedService.model;
        this.imagesList = [];
        this.visualizeService.getDataset(model.id).subscribe(response => {
            const len = response['images'].length;
            for (let i = 0; i < len; i++) {
                const im = response['images'][i];
                const image = new Image(im.id, im.dataset_id, im.name, im.relative_path, im.label);
                this.imagesList.push(image);
            }
            // this looks like wierd hack but it is needed for ng-select to detect changes
            // ng-select developers claim it's faster this way
            this.imagesList = [...this.imagesList];
        });
    }

    onSelectorSelect(image) {
        this.currentImage = image;
        this.onGetImage(this.currentImage);
    }

    onGetImage(image: Image) {
        this.visualizeService.getImage(image.imageId)
            .subscribe(response => {
                this.currentImage.display_path = response['image_path'];
            });
        this.currentImageVis = '';
    }

    onVisualize() {
        const model = this.selectedService.model;
        this.visualizeService.getImageVis(model.id, 0, this.currentImage.imageId)
            .subscribe(response => {
                this.currentImageVis = response['image_path'];
            });
    }

    onInference() {
        const model = this.selectedService.model;
        this.visualizeService.doInference(model.id, this.currentImage.imageId)
            .subscribe(response => {
                const scores = [];
                for (let i = 0; i < response['class_scores'].length; i++) {
                    const score = response['class_scores'][i];
                    scores.push({
                        'class_number': score.class_number,
                        'class_name': score.class_name,
                        'score': (score.score * 100).toFixed(2)
                    });
                }
                this.dataSource = new MatTableDataSource(scores);
            });
    }
}
