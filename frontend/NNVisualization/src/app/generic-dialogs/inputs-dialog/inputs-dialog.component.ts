import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-inputs-dialog',
    templateUrl: './inputs-dialog.component.html',
    styleUrls: ['./inputs-dialog.component.css']
})
export class InputsDialogComponent implements OnInit {

    public results: string[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        inputsNames: string[],
        title: string,
        proceedButtonLabel: string,
        abortButtonLabel: string
    }) { }

    ngOnInit() {
    }

}
