import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';
import { MatTableDataSource } from '@angular/material';

import { Architecture } from '../selected-architecture/architecture';
import { Model } from '../selected-architecture/model';

interface Element {
    position: number;
    name: string;
    id: number;
}

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
    private _architectures: Element[];
    private _models: Element[];
    add_new_arch_mode: boolean;

    displayedColumns = ['position', 'name'];
    archDataSource;
    modelDataSource;

    constructor(private selectedArchitectureService: SelectedArchitectureService,
                private restangular: Restangular) {
        this._architectures = [];
        this._models = [];
        this.add_new_arch_mode = false;
        this.archDataSource = new MatTableDataSource<Element>([]);
        this.modelDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this.restangular.all('listarchs')
            .getList().subscribe(_architectures => {
                this._architectures = _architectures;

                const archElems = [];
                for (let i = 0; i < this._architectures.length; i += 1) {
                    archElems.push({
                        position: i + 1,
                        name: this._architectures[i].name,
                        id: this._architectures[i].id,
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

    saveNewArchitecture(name: string) {
        console.log(name);
        this.add_new_arch_mode = false;
    }

    selectArchitecture(pos: number) {
        pos -= 1;

        this.restangular.one('getarch', this._architectures[pos].id)
            .get().subscribe(arch => {
                console.log(arch);
                const newArch = new Architecture(
                    arch.id, arch.name,
                    arch.architecture.nodes,
                    arch.architecture.links
                );
                this.selectedArchitectureService.architecture = newArch;
            });

        this.restangular.one('listmodels', this._architectures[pos].id)
            .getList().subscribe(_models => {
                this._models = _models;

                const modelElems = [];
                for (let i = 0; i < this._models.length; i += 1) {
                    modelElems.push({
                        position: i + 1,
                        name: this._models[i].name,
                        id: this._models[i].id,
                    });
                }
                this.modelDataSource = new MatTableDataSource<Element>(modelElems);
            });
    }

    selectModel(pos: number) {
        pos -= 1;
        const newModel = new Model(
            this._models[pos].id,
            this._models[pos].name
        );
        this.selectedArchitectureService.model = newModel;
    }
}
