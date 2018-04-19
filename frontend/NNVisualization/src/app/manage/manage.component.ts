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
    displayedColumns = ['position', 'name'];
    archDataSource;
    modelDataSource;

    selectedArchId: number;
    selectedModelId: number;

    importedArchitecture: File;
    importedModel: File;

    constructor(private selArchService: SelectedArchitectureService,
        private restangular: Restangular,
        private genericDialogs: GenericDialogsService) {
        this.archDataSource = new MatTableDataSource<Element>([]);
        this.modelDataSource = new MatTableDataSource<Element>([]);
    }

    ngOnInit() {
        this._updateArchitectureList();

        if (this.selArchService.architecture) {
            this.selectedArchId = this.selArchService.architecture.id;
            this._updateModelList();
            if (this.selArchService.model) {
                this.selectedModelId = this.selArchService.model.id;
            }
        }
    }

    private _updateArchitectureList(): void {
        this.restangular.all('list_archs')
            .getList().subscribe(_architectures => {
                const archElems = [];
                for (let i = 0; i < _architectures.length; i += 1) {
                    archElems.push({
                        position: i + 1,
                        name: _architectures[i].name,
                        id: _architectures[i].id,
                    });
                }
                this.archDataSource = new MatTableDataSource<Element>(archElems);
            });
    }

    private _updateModelList(): void {
        if (!this.selArchService.architecture) {
            return;
        }

        const arch_id = this.selArchService.architecture.id;
        this.restangular.one('list_models', arch_id)
            .getList().subscribe(_models => {
                const modelElems = [];
                for (let i = 0; i < _models.length; i += 1) {
                    modelElems.push({
                        position: i + 1,
                        name: _models[i].name,
                        id: _models[i].id,
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

    selectArchitecture(archElem: Element) {
        this.restangular.one('arch', archElem.id)
            .get().subscribe(
                arch => this._selectArchitecture(arch),
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    private _selectArchitecture(arch) {
        this.selectedArchId = arch.id;
        const newArch = new Architecture(
            arch.id, arch.name,
            arch.description,
            arch.architecture.nodes,
            arch.architecture.links,
            arch.last_used,
            arch.last_modified
        );
        this.selArchService.architecture = newArch;
        this._updateModelList();
    }

    selectModel(modelElem: Element) {
        this.selectedModelId = modelElem.id;
        this.restangular.one('model', modelElem.id)
            .get().subscribe(
                (model) => {
                    const newModel = new Model(
                        model.id,
                        model.name,
                        model.description,
                        model.loss,
                        model.optimizer,
                        model.optimizer_params,
                        model.batch_size,
                        model.nepochs,
                        model.train_loss,
                        model.valid_loss
                    );
                    this.selArchService.model = newModel;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    editCurrentArchitecture(): void {
        const arch = this.selArchService.architecture;
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
                    this.selArchService.architecture = newArch;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
        this._updateArchitectureList();
    }

    deleteCurrentArchitecture(): void {
        const arch = this.selArchService.architecture;
        this.restangular.one('arch', arch.id)
            .remove().subscribe(
                () => {
                    this._updateArchitectureList();
                    this.selArchService.architecture = undefined;
                    this.selectedArchId = undefined;
                    this.selectedModelId = undefined;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    editCurrentModel(): void {
        const model = this.selArchService.model;
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
                        nModel.description,
                        nModel.loss,
                        nModel.optimizer,
                        nModel.optimizer_params,
                        nModel.batch_size,
                        nModel.nepochs,
                        nModel.train_loss,
                        nModel.valid_loss
                    );
                    this.selArchService.model = newModel;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
        this._updateModelList();
    }

    deleteCurrentModel(): void {
        const model = this.selArchService.model;
        this.restangular.one('model', model.id)
            .remove().subscribe(
                () => {
                    this._updateModelList();
                    this.selArchService.model = undefined;
                    this.selectedModelId = undefined;
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
    }

    onArchitectureFileChange(event) {
        this.importedArchitecture = event.target.files[0];
    }

    onModelFileChange(event) {
        this.importedModel = event.target.files[0];
    }

    importArchitecture() {
        this.genericDialogs.createInputs(['Name', 'Description'])
            .afterClosed().subscribe(response => {
                if (response) {
                    const formData = new FormData();
                    formData.append('name', response['Name']);
                    formData.append('file', this.importedArchitecture);
                    if (response['Description']) {
                        formData.append('desc', response['Description']);
                    }
                    this.restangular.all('import_arch').post(formData).subscribe(
                        uploadResponse => {
                            this.genericDialogs.createSuccess(
                                'Architecture successfully imported');
                            this._updateArchitectureList();
                        },
                        error => {
                            this.genericDialogs.createWarning(error, 'Error');
                        }
                    );
                }
            });
    }

    importModel() {
        const fields = [
            'Architecture name',
            'Architecture description',
            'Model name',
            'Model description'
        ];
        this.genericDialogs.createInputs(fields)
            .afterClosed().subscribe(response => {
                if (response) {
                    const formData = new FormData();
                    formData.append('arch_name', response['Architecture name']);
                    formData.append('model_name', response['Model name']);
                    formData.append('file', this.importedModel);
                    if (response['Architecture escription']) {
                        formData.append('arch_desc', response['Architecture description']);
                    }
                    if (response['Model escription']) {
                        formData.append('model_desc', response['Model description']);
                    }
                    this.restangular.all('import_model').post(formData).subscribe(
                        data => {
                            this.genericDialogs.createSuccess(
                                'Model successfully imported');
                            this._updateArchitectureList();
                            this._selectArchitecture(data.arch);
                        },
                        error => {
                            this.genericDialogs.createWarning(error, 'Error');
                        }
                    );
                }
            });
    }
}
