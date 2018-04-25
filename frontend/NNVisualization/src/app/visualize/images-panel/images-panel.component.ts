import { Component, OnInit } from '@angular/core';
import { Image } from '../image.model';
import { MatTableDataSource } from '@angular/material';
import { VisualizeService } from '../visualize.service';
import { SelectedArchitectureService } from '../../selected-architecture/selected-architecture.service';
import { Postprocessing } from '../postprocessing.model';
import { Algorithm } from '../algorithm.model';



@Component({
    selector: 'app-images-panel',
    templateUrl: './images-panel.component.html',
    styleUrls: ['./images-panel.component.css']
})
export class ImagesPanelComponent implements OnInit {
    placeholder_img = 'api/static/placeholder2.jpg';
    currentImage: Image; // = new Image(-1, -1, '', '', -1);
    currentImageVis = '';

    currentImageName: any;
    imagesList: Image[] = [];
    onImageChecked = false;


    displayedColumns = ['class_number', 'class_name', 'score'];
    dataSource = new MatTableDataSource();

    constructor(private visualizeService: VisualizeService,
                private selectedService: SelectedArchitectureService) {

    }

    ngOnInit() {
        this.onGetDataset();
        this.onGetAlgorithms();
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
                this._parseb64(response['img'], (result) => { this.currentImage.display_path = result; });
            });
        this.currentImageVis = '';
    }

    onVisualize() {
        const model = this.selectedService.model;
        this.visualizeService.getImageVis(model.id, this.currentImage.imageId, this.onImageChecked)
            .subscribe(response => {
                this._parseb64(response['img'], (result) => { this.currentImageVis = result; });
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
                const scores2 = scores.sort((n1, n2) => n2.score - n1.score);
                const scores3 = scores2.slice(0, 10);
                this.dataSource = new MatTableDataSource(scores3);
            });
    }

    onSelectPostprocessing(event) {
        this.visualizeService.currentPostprocessing = event.value;
        this.visualizeService.disabledButton = false;
        // this.visualizeService.selectedPostprocessing = this.visualizeService.postprocessingList[event.value];
    }

    onSelectorAlgorithm(event) {
        this.visualizeService.currentAlgorithm = event.value;
        this.visualizeService.disabledButton = true;
        this.visualizeService.postprocessingList = [];
        this.visualizeService.currentPostprocessing = -1;
        this.visualizeService.selectedPostprocessing = undefined;
        this.onGetPostprocessing(this.visualizeService.currentAlgorithm);
    }

    onGetPostprocessing(alg_id: number) {
        this.visualizeService.getPostprcessing(alg_id).subscribe(response => {
            const len = response['postprocessing'].length;
            this.visualizeService.postprocessingList = [];
            for (let i = 0; i < len; i++) {
                const p = response['postprocessing'][i];
                const postprocessing = new Postprocessing(p.id, p.name);
                this.visualizeService.postprocessingList.push(postprocessing);
            }
        });
    }

    onGetAlgorithms() {
        this.imagesList = [];
        this.visualizeService.getAlgorithms().subscribe(response => {
            const len = response['algorithms'].length;
            for (let i = 0; i < len; i++) {
                const a = response['algorithms'][i];
                const algorithm = new Algorithm(a.id, a.name);
                this.visualizeService.algorithmsList.push(algorithm);
            }
        });
    }

    _parseb64(img_blob, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            callback(reader.result);
        }, false);

        reader.readAsDataURL(img_blob);

    }
}
