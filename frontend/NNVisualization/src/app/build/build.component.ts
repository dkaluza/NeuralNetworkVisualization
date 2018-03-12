import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';
import { MatDialog, MatDialogRef } from '@angular/material';

import { VisArchComponent } from '../vis-arch/vis-arch.component';

import { ArchNode, ArchLink } from '../selected-architecture/architecture';

import { Layer } from '../vis-arch/layers/layer/layer';
import { FullyConnectedLayer } from '../vis-arch/layers/fully-connected/fully-connected';
import { ConvLayer } from '../vis-arch/layers/conv/conv';
import { InputLayer } from '../vis-arch/layers/input/input';

@Component({
    selector: 'app-build',
    templateUrl: './build.component.html',
    styleUrls: ['./build.component.css']
})
export class BuildComponent implements OnInit {

    private _saveCurrentMessage: string;
    private _saveNewMessage: string;

    nodes: Map<number, Layer>;
    links: ArchLink[];
    hasNodesBeenModified = false;

    selectedLayer: Layer;
    private selectedID: number;

    constructor(private selArchService: SelectedArchitectureService,
                private restangular: Restangular,
                public dialog: MatDialog) {
        this._saveCurrentMessage = 'Save';
        this._saveNewMessage = 'Save as new';
    }

    ngOnInit() {
        if (!this.selArchService.architecture) {
            this.selArchService.currentNodes = new Map;
            this.selArchService.currentLinks = [];
        }
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;
    }

    private _unselectNode(): void {
        this.selectedLayer = undefined;
        this.selectedID = undefined;
    }

    onGraphModified(data): void {
        this.selArchService.currentNodes = data.nodes;
        this.selArchService.currentLinks = data.links;
    }

    onNodeSelected(id): void {
        this.selectedLayer = this.nodes.get(id);
        this.selectedID = id;
    }

    onNodeUpdate(): void {
        this.hasNodesBeenModified = !this.hasNodesBeenModified;
        // this.hasNodesBeenModified = true;
    }

    clearCurrentArch(): void {
        this.selArchService.currentNodes.clear();
        this.selArchService.currentLinks = [];
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;

        this._unselectNode();
    }

    resetArch(): void {
        this.selArchService.architecture = this.selArchService.architecture;
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;

        this._unselectNode();
    }

    saveCurrentArch() {
        if (this.selArchService.architecture) {
            const arch = this.selArchService.architecture;

            const data = {
                graph: {
                    nodes: this.selArchService.currentNodesToDict(),
                    links: this.selArchService.currentLinks
                }
            };
            this.restangular.all('arch').all(arch.id)
                .post(data).subscribe(
                    (nArch) => {},
                    () => { alert('Error :('); }
                );
        }
    }

    saveAsNewArch() {
        // TODO use MatDialog
        // let dialogRef = this.dialog.open(DescDialog);

        // dialogRef
        //     .afterClosed()
        //     .filter(result => result)
        //     .subscribe(result => {
        //         this.saveArch(name, result, undefined)
        //         this._saveNewMessage = 'Saved successfully!'
        //         setTimeout(() => {
        //             this._saveNewMessage = 'Save as new'
        //         }, this._msgTimeout)
        //     });

        const name = prompt('Enter a name:');
        if (name === null || name === '') { return; }
        const desc = prompt('Enter a short description:');
        if (desc === null) { return; }

        const data = {
            name: name,
            description: desc,
            graph: {
                nodes: this.selArchService.currentNodesToDict(),
                links: this.selArchService.currentLinks
            }
        };
        this.restangular.all('upload_arch')
            .post(data).subscribe(
                () => { alert('Save successful!'); },
                () => { alert('Something fucked up while saving'); }
            );
    }

    get saveCurrentMsg(): string {
        return this._saveCurrentMessage;
    }

    get saveNewMsg(): string {
        return this._saveNewMessage;
    }
}

@Component({
    selector: 'desc-dialog',
    templateUrl: 'desc-dialog.component.html'
})
export class DescDialog {

    private _text: string;

    constructor(
        private dialogRef: MatDialogRef<DescDialog>
    ) {}

    save() {
        this.dialogRef.close(this._text);
    }

    cancel() {
        this.dialogRef.close();
    }
}
