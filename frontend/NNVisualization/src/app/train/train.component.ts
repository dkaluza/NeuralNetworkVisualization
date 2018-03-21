import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';
import { MatTableDataSource } from '@angular/material';

interface Element {
    position: number;
    name: string;
    id: number;
}

@Component({
    selector: 'app-train',
    templateUrl: './train.component.html',
    styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

    nepochs = '10';
    batchSize = '32';
    learningRate = '0.1';
    selectedDatasetId: number = undefined;
    selectedDatasetName: string = undefined;

    losses = [
        {
            'value': 'logloss',
            'name': 'Logloss'
        }, {
            'value': 'mse',
            'name': 'Mean squared error'
        }
    ];
    loss: string = undefined;
    lossName: string = undefined;

    optimizers = [
        {
            'value': 'adam',
            'name': 'Adam'
        } , {
            'value': 'sgd',
            'name': 'Gradient Descent'
        }
    ];
    optimizer: string = undefined;
    optimizerName: string = undefined;

    optimizerParamsSets = {
        'sgd': [ {
            'name': 'Learning rate', 'value': 'lr', 'default': 0.1
        } ],
        'adam': [ {
            'name': 'Learning rate', 'value': 'lr', 'default': 0.001
        }, {
            'name': 'Beta 1', 'value': 'beta1', 'default': 0.9
        }, {
            'name': 'Beta 2', 'value': 'beta2', 'default': 0.999
        }, {
            'name': 'Epsilon', 'value': 'epsilon', 'default': 0.00000001
        }]
    };
    optimizerParams = undefined;

    displayedColumns = ['position', 'name'];

    private _datasets: Element[];
    datasetDataSource;

    constructor(private restangular: Restangular,
        private selArchService: SelectedArchitectureService,
        private genericDialog: GenericDialogsService) {

        this._datasets = [];
        this.datasetDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateDatasetList();
    }

    _updateDatasetList() {
        this.restangular.all('list_datasets')
            .getList().subscribe(datasets => {
                this._datasets = datasets;

                const datasetElems = [];
                for (let i = 0; i < this._datasets.length; i += 1) {
                    datasetElems.push({
                        position: i + 1,
                        name: this._datasets[i].name,
                        id: this._datasets[i].id
                    });
                }
                this.datasetDataSource = new MatTableDataSource<Element>(datasetElems);
            });
    }

    selectDataset(dataset: Element) {
        this.selectedDatasetId = dataset.id;
        this.selectedDatasetName = dataset.name;
    }

    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }

    onLossChange(value) {
        this.loss = value;
        for (let i = 0; i < this.losses.length; i += 1) {
            if (this.losses[i].value === value) {
                this.lossName = this.losses[i].name;
                break;
            }
        }
    }

    onOptimizerChange(value) {
        this.optimizerParams = new Map;
        for (let i = 0; i < this.optimizers.length; i += 1) {
            if (this.optimizers[i].value === value) {
                this.optimizerName = this.optimizers[i].name;
                break;
            }
        }
        this.optimizerParamsSets[value].forEach(
            val => {
                this.optimizerParams.set(val.value, val.default);
            }
        );
        this.optimizer = value;
    }

    onParamChange(param, value) {
        this.optimizerParams.set(param, value);
    }

    onTrain() {
        if (!this.selArchService.architecture) {
            this.genericDialog.createWarning('No architecture selected');
            return;
        }
        if (!this.selectedDatasetId || !this.loss ||
            !this.optimizer || !this.batchSize || !this.nepochs) {
            this.genericDialog.createWarning('Wrong training parameters');
            return;
        }
        for (let i = 0; i < this.optimizerParamsSets[this.optimizer].length; i += 1) {
            const val = this.optimizerParamsSets[this.optimizer][i];
            if (this.optimizerParams.get(val.value) === '') {
                this.genericDialog.createWarning(
                    'Optimizer parameter \'' + val.name + '\' must be a number'
                );
                return;
            }
        }
        this.genericDialog.createInputs(['Name', 'Description']).afterClosed().subscribe(
            result => {
                const params = {};
                this.optimizerParams.forEach((v, k) => { params[k] = v; } );
                if (result && result['Name']) {
                    const data = {
                        name: result['Name'],
                        description: result['Description'],
                        nepochs: Number(this.nepochs),
                        batch_size: Number(this.batchSize),
                        loss: this.loss,
                        optimizer: this.optimizer,
                        optimizer_params: params,
                        dataset_id: this.selectedDatasetId
                    };
                    const id = this.selArchService.architecture.id;
                    this.restangular.all('train_new_model/' + String(id))
                        .post(data).subscribe(
                            (ans) => { this.genericDialog.createSuccess('Training started successfully'); },
                            () => { this.genericDialog.createWarning('Couldn\'t start training'); }
                        );
                }
            }
        );
    }

}
