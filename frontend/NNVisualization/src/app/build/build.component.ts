import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service'
import { Restangular } from 'ngx-restangular';
import { MatDialog, MatDialogRef } from  '@angular/material';

@Component({
    selector: 'app-build',
    templateUrl: './build.component.html',
    styleUrls: ['./build.component.css']
})
export class BuildComponent implements OnInit {

    private _saveCurrentMessage: string;
    private _saveNewMessage: string;

    constructor(private selectedArchitectureService: SelectedArchitectureService,
                private restangular: Restangular,
                public dialog: MatDialog) {
        this._saveCurrentMessage = 'Save';
        this._saveNewMessage = 'Save as new';
    }

    ngOnInit() {
    }

    saveCurrentArch() {
        if (this.selectedArchitectureService.architecture) {
            let currId = this.selectedArchitectureService.architecture.id;
            let currName = this.selectedArchitectureService.architecture.name;
            let currDesc = this.selectedArchitectureService.architecture.description;
            this.saveArch(currName, currDesc, currId);
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

        let name = prompt("Enter a name:");
        let desc = prompt("Enter a short description:");

        if (desc != null && name != null)
            this.saveArch(name, desc, undefined);
    }

    private saveArch(name: string, description: string, id?: number) {
        // TODO: passing the selected arch somehow
        let postData = {
            'name': name,
            'description': description
        };

        if (id) postData['id'] = id;

        this.restangular
            .one('add')
            .post(postData)
            .subscribe(
                () => { alert('Save successful!') },
                () => { alert('Something fucked up while saving') }
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
