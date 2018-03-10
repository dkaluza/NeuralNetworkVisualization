import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { TimeoutAlertComponent } from './timeout-alert/timeout-alert.component'

interface AlertData {
    title: string,
    message: string
}

@Injectable()
export class GenericDialogsService {



    private readonly _initialAlertTopMargin = "8rem";
    private readonly _initialAlertRightMargin = "5rem";
    private readonly _alertConfig: MatDialogConfig<AlertData> = {
        position: {
            right: this._initialAlertRightMargin,
            top: this._initialAlertTopMargin
        },
        disableClose: false,
        hasBackdrop: false,
        autoFocus: false
    };


    constructor(private dialog: MatDialog) { }

    public createWarning(message: string, title = ""): MatDialogRef<TimeoutAlertComponent> {
        const warningConfig = Object.assign({}, this._alertConfig, {
            panelClass: "warning-dialog",
            data: { title: title, message: message }
        });

        return this.dialog.open(TimeoutAlertComponent, warningConfig);
    }

    public createSuccess(message: string, title = ""): MatDialogRef<TimeoutAlertComponent> {
        const successConfig = Object.assign({}, this._alertConfig, {
            panelClass: "success-dialog",
            data: { title: title, message: message }
        });

        return this.dialog.open(TimeoutAlertComponent, successConfig);
    }
}
