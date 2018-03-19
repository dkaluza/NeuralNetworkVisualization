import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Restangular } from 'ngx-restangular';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';


interface Element {
    position: number;
    name: string;
    id: number;
}

@Component({
    selector: 'app-datasets',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit {
    displayedColumns = ['position', 'name'];
    datasetsDataSource: MatTableDataSource<Element>;
    selectedDatasetId: number;
    newDatasetFile: File;

    constructor(private restangular: Restangular,
        private genericDialogs: GenericDialogsService) {
        this.datasetsDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateDatasetList();
    }

    private _updateDatasetList(): void {
        this.restangular.all('list_datasets')
            .getList().subscribe(datasets => {
                const datasetsElems = [];
                for (let i = 0; i < datasets.length; i += 1) {
                    datasetsElems.push({
                        position: i + 1,
                        name: datasets[i].name,
                        id: datasets[i].id,
                    });
                }
                this.datasetsDataSource = new MatTableDataSource<Element>(datasetsElems);
            });
    }


    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }

    selectDataset(datasetElem: Element) {
        this.selectedDatasetId = datasetElem.id;
        this.restangular.one('dataset', datasetElem.id).get().subscribe();
    }

    onDatasetFileChange(event) {
        this.newDatasetFile = event.target.files[0];
    }

    addDataset(): void {
        // TODO:
    }
}
