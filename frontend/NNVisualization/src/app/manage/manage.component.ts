import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';
import { MatTableDataSource } from '@angular/material';
import { saveAs } from 'file-saver/FileSaver';

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
        this.selectedArchId = archElem.id;
        this.restangular.one('arch', archElem.id)
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
                    this.selArchService.architecture = newArch;
                    this._updateModelList();
                },
                (e) => { this.genericDialogs.createWarning(e); }
            );
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

    exportCurrentModel(): void {
        const model = this.selArchService.model;
        this.restangular.one('export_model', model.id)
            .get().subscribe(response => {
                this.saveToFile(response['file'], response['filename']);
            });
    }

    exportCurrentArchitecture(): void {
        const arch = this.selArchService.architecture;
        this.restangular.one('export_arch', arch.id)
            .get().subscribe(response => {
                this.saveToFile(response['file'], response['filename']);
            });
    }

    private saveToFile(fileData, fileName) {
        const blob = this._b64toBlob(fileData, 'application/octet-stream');
        saveAs(blob, fileName);
    }

    private _b64toBlob(base64Data, contentType) {
        contentType = contentType || '';
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }
}
