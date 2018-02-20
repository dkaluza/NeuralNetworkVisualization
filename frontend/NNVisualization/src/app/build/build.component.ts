import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';
import { MatDialog, MatDialogRef } from '@angular/material';

import { VisArchComponent } from '../vis-arch/vis-arch.component';

@Component({
    selector: 'app-build',
    templateUrl: './build.component.html',
    styleUrls: ['./build.component.css']
})
export class BuildComponent implements OnInit {

    @ViewChild(VisArchComponent)
    private visArch: VisArchComponent;

    private _saveCurrentMessage: string;
    private _saveNewMessage: string;

    constructor(private selArchService: SelectedArchitectureService,
                private restangular: Restangular,
                public dialog: MatDialog) {
        this._saveCurrentMessage = 'Save';
        this._saveNewMessage = 'Save as new';
    }

    ngOnInit() {
    }

    clearCurrentArch(): void {
        this.selArchService.currentNodes = [];
        this.selArchService.currentLinks = [];
        this.visArch.importFromCurrentArch();
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
        this.restangular.all('arch')
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
