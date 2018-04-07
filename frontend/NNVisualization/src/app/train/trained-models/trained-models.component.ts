import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Restangular } from 'ngx-restangular';
import { GenericDialogsService } from '../../generic-dialogs/generic-dialogs.service';

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
    private historyUpdateSocket: WebSocket;

    constructor(private restangular: Restangular,
        private genericDialogs: GenericDialogsService) {
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
        if (row.id !== this.selctedHistoryID) {
            this.selctedHistoryID = row.id;
            this._connectToWebSocket(this.selctedHistoryID);
        }
    }

    private _connectToWebSocket(id: number) {
        if (this.historyUpdateSocket) {
            this.historyUpdateSocket.close();
        }
        try {
            this.historyUpdateSocket = new WebSocket('ws://' + location.host +
                '/api/currently_training/' + id);
            this.historyUpdateSocket.onmessage = event => {
                const data = JSON.parse(event.data);
                console.log(data); // TODO: on error listener
            };
        } catch (e) {
            this.genericDialogs.createWarning(e.message, 'Error');
        }
    }

    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }
}
