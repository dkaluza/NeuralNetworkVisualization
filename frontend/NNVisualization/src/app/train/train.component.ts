import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

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
        private selArchService: SelectedArchitectureService,
        private genericDialog : GenericDialogsService) { }

    ngOnInit() {
    }

    onTrain() {
        if (!this.selArchService.architecture) {
            this.genericDialog.createWarning('No architecture selected');
            return;
        }
        this.genericDialog.createInputs(['Name', 'Description']).afterClosed().subscribe(
            result => {
                if (result && result['Name']) {
                    const data = {
                        name: result['Name'],
                        description: result['Description'],
                        nepochs: Number(this.nepochs),
                        batch_size: Number(this.batchSize),
                        learning_rate: Number(this.learningRate)
                    };
                    const id = this.selArchService.architecture.id;
                    this.restangular.all('train_new_model/' + String(id) + '/' + String(1))
                        .post(data).subscribe(
                            (ans) => { this.genericDialog.createSuccess('Training started successfully'); },
                            () => { this.genericDialog.createWarning('Couldn\'t start training'); }
                        );
                }
            }
        );
    }

}
