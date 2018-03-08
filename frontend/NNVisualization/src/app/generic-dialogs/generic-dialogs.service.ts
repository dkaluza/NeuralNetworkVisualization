import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component'


@Injectable()
export class GenericDialogsService {

    private readonly _initialTopMargin = "8rem";
    private readonly _initialRightMargin = "5rem";


    constructor(private dialog: MatDialog) { }

    public createWarning(message: string, title = ""): MatDialogRef<WarningDialogComponent> {
        return this.dialog.open(WarningDialogComponent, {
            position: {
                right: this._initialRightMargin,
                top: this._initialTopMargin
            },
            data: {
                title: title,
                message: message
            },
            disableClose: false,
            hasBackdrop: false,
            panelClass: "warning-dialog",
            autoFocus: false
        })
    }
}
