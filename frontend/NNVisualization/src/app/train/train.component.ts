import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

@Component({
    selector: 'app-train',
    templateUrl: './train.component.html',
    styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

    nepochs = '10';
    batchSize = '32';
    learningRate = '0.1';

    constructor(private restangular: Restangular,
                private selArchService: SelectedArchitectureService) { }

    ngOnInit() {
    }

    onTrain() {
        const name = prompt('Provide name');
        if (name === undefined || name === '') {
            return;
        }

        const desc = prompt('Provide description');
        if (desc === undefined) {
            return;
        }
        const data = {
            name: name,
            description: desc,
            nepochs: Number(this.nepochs),
            batch_size: Number(this.batchSize),
            learning_rate: Number(this.learningRate)
        };

        if (this.selArchService.architecture) {
            const id = this.selArchService.architecture.id;
            this.restangular.all('train_new_model/' + String(id) + '/' + String(1))
                .post(data).subscribe(
                    (ans) => { console.log(ans); },
                    () => { alert('Error :('); }
                );
        } else {
            alert('No architecture selected');
        }
    }

}
