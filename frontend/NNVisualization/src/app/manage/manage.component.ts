import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';
import { MatTableDataSource } from '@angular/material';

import { Architecture } from '../selected-architecture/architecture';
import { Model } from '../selected-architecture/model';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

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

    displayedColumns = ['position', 'name'];
    archDataSource;
    modelDataSource;

    constructor(private selectedArchitectureService: SelectedArchitectureService,
        private restangular: Restangular,
        private genericDialogs: GenericDialogsService) {
        this._architectures = [];
        this._models = [];
        this.archDataSource = new MatTableDataSource<Element>([]);
        this.modelDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateArchitectureList();
        this._updateModelList();
    }

    private _updateArchitectureList(): void {
        this.restangular.all('list_archs')
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

    private _updateModelList(): void {
        if (!this.selectedArchitectureService.architecture) {
            return;
        }

        const arch_id = this.selectedArchitectureService.architecture.id;
        this.restangular.one('list_models', arch_id)
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

    applyFilter(dataSource, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        dataSource.filter = filterValue;
    }

    selectArchitecture(pos: number) {
        pos -= 1;
        this.restangular.one('arch', this._architectures[pos].id)
            .get().subscribe(
                (arch) => {
                    const newArch = new Architecture(
                        arch.id, arch.name,
                        arch.description,
                        arch.architecture.nodes,
                        arch.architecture.links,
                        arch.last_used,
                        arch.last_modified
                    );
                    this.selectedArchitectureService.architecture = newArch;
                    this._updateModelList();
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    selectModel(pos: number) {
        pos -= 1;
        this.restangular.one('model', this._models[pos].id)
            .get().subscribe(
                (model) => {
                    const newModel = new Model(
                        model.id,
                        model.name,
                        model.description
                    );
                    this.selectedArchitectureService.model = newModel;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    editCurrentArchitecture(): void {
        const arch = this.selectedArchitectureService.architecture;
        this.genericDialogs.createInputs(['Name', 'Description']).afterClosed().subscribe(
            result => {
                if (result) {
                    const data = {};
                    if (result['Name']) {
                        data['name'] = result['Name'];
                    }
                    if (result['Description']) {
                        data['description'] = result['Description'];
                    }

                    this._editCurrentArchitectureWithData(arch, data);
                }
            }
        );
    }

    private _editCurrentArchitectureWithData(arch, data) {
        this.restangular.all('arch').all(arch.id)
            .post(data)
            .subscribe(
                (nArch) => {
                    const newArch = new Architecture(
                        nArch.id, nArch.name,
                        nArch.description,
                        nArch.architecture.nodes,
                        nArch.architecture.links,
                        nArch.last_used,
                        nArch.last_modified
                    );
                    this.selectedArchitectureService.architecture = newArch;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
        this._updateArchitectureList();
    }

    deleteCurrentArchitecture(): void {
        const arch = this.selectedArchitectureService.architecture;
        this.restangular.one('arch', arch.id)
            .remove().subscribe(
                () => {
                    this._updateArchitectureList();
                    this.selectedArchitectureService.architecture = undefined;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    editCurrentModel(): void {
        const model = this.selectedArchitectureService.model;
        const newName = prompt('Provide name:');
        const newDesc = prompt('Provide description:');

        const data = {};
        if (newName !== '') {
            data['name'] = newName;
        }
        if (newDesc !== '') {
            data['description'] = newDesc;
        }

        this.restangular.all('model').all(model.id)
            .post(data)
            .subscribe(
                (nModel) => {
                    const newModel = new Model(
                        nModel.id,
                        nModel.name,
                        nModel.description
                    );
                    this.selectedArchitectureService.model = newModel;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
        this._updateModelList();
    }

    deleteCurrentModel(): void {
        const model = this.selectedArchitectureService.model;
        this.restangular.one('model', model.id)
            .remove().subscribe(
                () => {
                    this._updateModelList();
                    this.selectedArchitectureService.model = undefined;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }
}
