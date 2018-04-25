import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Restangular } from 'ngx-restangular';
import { GenericDialogsService } from '../../generic-dialogs/generic-dialogs.service';
import { IOSocketService } from '../../iosocket/iosocket.service';

interface Element {
    position: number;
    modelName: string;
    id: number;
    archName: string;
    currentEpoch: number;
    numberOfEpochs: number;
}

interface SelectedHistory {
    modelName: string;
    archName: string;
    batchSize: number;
    currentEpoch: number;
    numberOfEpochs: number;
    trainingLoss: number;
    trainingAcc: number;
    validationLoss: number;
    validationAcc: number;
}

@Component({
    selector: 'app-trained-models',
    templateUrl: './trained-models.component.html',
    styleUrls: ['./trained-models.component.css']
})
export class TrainedModelsComponent implements OnInit, OnDestroy {
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
    selectedHistoryID: number;
    selectedHistory: SelectedHistory;
    private selectedHistoryUpdateSocket: any;
    private historyListSocket: any;

    constructor(private restangular: Restangular,
        private genericDialogs: GenericDialogsService,
        private iosockets: IOSocketService) {
        this.historyDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._connectToHistoryListSocket();
    }

    private _connectToHistoryListSocket() {
        this._closeSocket(this.historyListSocket);
        this.historyListSocket = this.iosockets.newSocket('list_trained_models');
        this.historyListSocket.on('list_update', data => {
            this._updateHistoriesList(data);
        });
        this.historyListSocket.on('error', error => {
            this.genericDialogs.createWarning(error, 'Websocket error');
        });
    }

    private _updateHistoriesList(histories): void {
        const historyElems = [];
        for (let i = 0; i < histories.length; i += 1) {
            historyElems.push({
                position: i + 1,
                modelName: histories[i].model_name,
                id: histories[i].id,
                archName: histories[i].arch_name,
                currentEpoch: histories[i].current_epoch,
                numberOfEpochs: histories[i].number_of_epochs
            });
        }
        this.historyDataSource = new MatTableDataSource<Element>(historyElems);
    }

    private _closeSocket(socket) {
        if (socket && socket.connected) {
            socket.close();
        }
    }

    ngOnDestroy() {
        this._closeSocket(this.selectedHistoryUpdateSocket);
        this._closeSocket(this.historyListSocket);
    }


    selectHistory(row: Element) {
        if (row.id !== this.selectedHistoryID) {
            this.selectedHistoryID = row.id;
            this._connectToSelectedHistorySocket(this.selectedHistoryID);
        }
    }

    private _connectToSelectedHistorySocket(id: number) {
        this._closeSocket(this.selectedHistoryUpdateSocket);
        this.selectedHistoryUpdateSocket = this.iosockets
            .newSocket('currently_training', id);
        this.selectedHistoryUpdateSocket.on('new_epoch', data => {
            this._updateSelectedHistory(data);
        });
        this.selectedHistoryUpdateSocket.on('error', error => {
            this.genericDialogs.createWarning(error, 'Websocket error');
        });
    }

    private _updateSelectedHistory(data) {
        this.selectedHistory = {
            modelName: data.model_name,
            archName: data.arch_name,
            batchSize: data.batch_size,
            currentEpoch: data.current_epoch,
            numberOfEpochs: data.number_of_epochs,
            trainingLoss: data.train_loss,
            trainingAcc: data.train_acc,
            validationLoss: data.valid_loss,
            validationAcc: data.valid_acc
        };

    }

    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }
}
