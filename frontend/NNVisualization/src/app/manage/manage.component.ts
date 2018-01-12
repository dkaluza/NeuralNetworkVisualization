import { Component, OnInit, Inject } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { MatTableDataSource } from '@angular/material';

interface Element {
    position: number;
    name: string;
    id: number;
}

interface Arch {
    name: string;
    id: number;
}

interface Model {
    name: string;
    id: number;
}

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

    architectures: Arch[] = [];
    models: Model[] = [];
    add_new_arch_mode = false;

    new_arch_name = '';
    new_arch_desc = '';

    displayedColumns = ['position', 'name'];
    archDataSource = new MatTableDataSource<Element>([]);
    modelDataSource = new MatTableDataSource<Element>([]);

    constructor(private restangular: Restangular) {
    }

    ngOnInit() {
        this.restangular.all('listarchs')
            .getList().subscribe(_architectures => {
                this.architectures = _architectures;

                const archElems = [];
                for (let i = 0; i < this.architectures.length; i += 1) {
                    archElems.push({
                        position: i + 1,
                        name: this.architectures[i].name,
                        id: this.architectures[i].id,
                    });
                }
                this.archDataSource = new MatTableDataSource<Element>(archElems);
            });
    }

    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }

    addNewArchitecture() {
        this.add_new_arch_mode = true;
    }

    saveNewArchitecture() {
        this.add_new_arch_mode = false;
    }

    selectArchitecture(id) {
        console.log('You have selected architecture: ' + id);
        this.restangular.one('listmodels', id)
            .getList().subscribe(_models => {
                this.models = _models;

                const modelElems = [];
                for (let i = 0; i < this.models.length; i += 1) {
                    modelElems.push({
                        position: i + 1,
                        name: this.models[i].name,
                        id: this.models[i].id,
                    });
                }
                this.modelDataSource = new MatTableDataSource<Element>(modelElems);
            });
    }

    selectModel(id) {
        // TODO: selecting model
        console.log('You have selected model: ' + id);
    }
}
