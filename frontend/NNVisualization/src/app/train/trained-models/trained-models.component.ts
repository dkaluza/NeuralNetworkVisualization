import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Restangular } from 'ngx-restangular';

interface Element {
    position: number;
    name: string;
    id: number;
    archName: string;
}

@Component({
    selector: 'app-trained-models',
    templateUrl: './trained-models.component.html',
    styleUrls: ['./trained-models.component.css']
})
export class TrainedModelsComponent implements OnInit {
    displayedColumns = ['position', 'name', 'archName'];
    modelDataSource;


    constructor(private restangular: Restangular) {
        this.modelDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateModelList();
    }

    private _updateModelList(): void {
        this.restangular.all('list_trained_models')
            .getList().subscribe(_models => {
                const modelElems = [];
                for (let i = 0; i < _models.length; i += 1) {
                    modelElems.push({
                        position: i + 1,
                        name: _models[i].name,
                        id: _models[i].id,
                        archName: _models[i].archName
                    });
                }
                this.modelDataSource = new MatTableDataSource<Element>(modelElems);
            });
    }
}
