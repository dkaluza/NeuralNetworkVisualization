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
    selectedDatasetDesc: string;
    selectedDatasetName: string;
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
        this.restangular.one('dataset', datasetElem.id).get().subscribe(
            response => {
                this.selectedDatasetDesc = response.description;
                this.selectedDatasetName = response.name;
            },
            error => {
                this.genericDialogs.createWarning(error);
            }
        );
    }

    onDatasetFileChange(event) {
        this.newDatasetFile = event.target.files[0];
    }

    addDataset() {
        this.genericDialogs.createInputs(['Name', 'Description', 'Labels'])
            .afterClosed().subscribe(response => {
                if (response) {
                    this._addDatasetWithData(response['Name'], response['Description'],
                        response['Labels']);
                }
            });
    }

    private _addDatasetWithData(name: string, desc: string, labels: string) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('labels', labels);
        formData.append('file', this.newDatasetFile);
        if (desc) {
            formData.append('description', desc);
        }

        this.restangular.all('upload_dataset').post(formData).subscribe(
            response => {
                this.genericDialogs.createSuccess('Dataset successfuly added!');
                this._updateDatasetList();
            },
            error => {
                this.genericDialogs.createWarning(error, 'Error');
            }
        );

    }

    deleteDataset() {
        this.restangular.one('dataset', this.selectedDatasetId).remove().subscribe(
            response => {
                this.genericDialogs.createSuccess('Dataset successfuly deleted');
                this._updateDatasetList();
                this.selectedDatasetId = undefined;
            },
            error => { this.genericDialogs.createWarning(error); }
        );
    }

    /* for edit in the future
    editDataset() {
        this.genericDialogs.createInputs(['Name', 'Description', 'Labels'])
            .afterClosed().subscribe(response => {
                if (response) {
                    this.editDatasetWithData(this.selectedDatasetId, response['Name'], response['Description'],
                        response['Labels']);
                }
            });
    }

    private editDatasetWithData(id: number, name: string, desc: string, labels: string) {
        const data = {};
        if (name) {
            data['name'] = name;
        }
        if (desc) {
            data['description'] = desc;
        }
        if (labels) {
            data['labels'] = labels;
        }
    }
    */
}
