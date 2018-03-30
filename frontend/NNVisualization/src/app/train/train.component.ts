import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';
import { MatTableDataSource } from '@angular/material';
import { TrainParamsService, LossFunction,
         Optimizer, OptimizerParam } from './train-params.serivce';

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

    loss: LossFunction;
    optimizer: Optimizer;

    displayedColumns = ['position', 'name'];

    private _datasets: Element[];
    datasetDataSource;

    constructor(private restangular: Restangular,
        private selArchService: SelectedArchitectureService,
        private genericDialog: GenericDialogsService,
        public trainParams: TrainParamsService) {

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

    onLossChange(id) {
        this.loss = this.trainParams.getLoss(id);
    }

    onOptimizerChange(id) {
        this.optimizer = Object.assign({}, this.trainParams.getOptimizer(id));
        // this.optimizerParams = new Map;
        // for (let i = 0; i < this.optimizers.length; i += 1) {
        //     if (this.optimizers[i].value === value) {
        //         this.optimizerName = this.optimizers[i].name;
        //         break;
        //     }
        // }
        // this.optimizerParamsSets[value].forEach(
        //     val => {
        //         this.optimizerParams.set(val.value, val.default);
        //     }
        // );
        // this.optimizer = value;
    }

    onParamChange(param, value) {
        this.optimizer.params.find(p => p.id === param).value = value;
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
        for (let i = 0; i < this.optimizer.params.length; i += 1) {
        // for (let i = 0; i < this.optimizerParamsSets[this.optimizer].length; i += 1) {
            const param = this.optimizer.params[i];
            if (param.value === null || param.value === undefined) {
                this.genericDialog.createWarning(
                    'Optimizer parameter \'' + param.name + '\' must be a number'
                );
                return;
            }
        }
        this.genericDialog.createInputs(['Name', 'Description']).afterClosed().subscribe(
            result => {
                if (result && result['Name']) {
                    const data = {
                        name: result['Name'],
                        description: result['Description'],
                        nepochs: Number(this.nepochs),
                        batch_size: Number(this.batchSize),
                        loss: this.loss,
                        optimizer: this.optimizer,
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
