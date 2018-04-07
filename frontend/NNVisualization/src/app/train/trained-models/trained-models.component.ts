import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Restangular } from 'ngx-restangular';

interface Element {
    position: number;
    modelName: string;
    id: number;
    archName: string;
    currentEpoch: number;
    numberOfEpochs: number;
}

@Component({
    selector: 'app-trained-models',
    templateUrl: './trained-models.component.html',
    styleUrls: ['./trained-models.component.css']
})
export class TrainedModelsComponent implements OnInit {
    displayedColumns = [
        {
            property: 'position',
            header: 'Position'
        },
        {
            property: 'modelName',
            header: 'Model name'
        },
        {
            property: 'archName',
            header: 'Architecture name'
        },
        {
            property: 'currentEpoch',
            header: 'Current epoch'
        },
        {
            property: 'numberOfEpochs',
            header: 'Number of epochs'
        }];
    displayedColumnsIds = this.displayedColumns.map(elem => elem.property);
    historyDataSource: MatTableDataSource<Element>;
    selctedHistoryID: number;


    constructor(private restangular: Restangular) {
        this.historyDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateModelList();
    }

    private _updateModelList(): void {
        this.restangular.all('list_trained_models')
            .getList().subscribe(_models => {
                const historyElems = [];
                for (let i = 0; i < _models.length; i += 1) {
                    historyElems.push({
                        position: i + 1,
                        modelName: _models[i].model_name,
                        id: _models[i].id,
                        archName: _models[i].arch_name,
                        currentEpoch: _models[i].current_epoch,
                        numberOfEpochs: _models[i].number_of_epochs
                    });
                }
                this.historyDataSource = new MatTableDataSource<Element>(historyElems);
            });
    }

    selectHistory(row: Element) {
        this.selctedHistoryID = row.id;
    }
}
