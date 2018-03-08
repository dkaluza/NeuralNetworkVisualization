import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-warning-dialog',
    templateUrl: './warning-dialog.component.html',
    styleUrls: ['./warning-dialog.component.css']
})
export class WarningDialogComponent implements OnInit {

    constructor(private dialogRef: MatDialogRef<WarningDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }) {
        setTimeout(() => { this.dialogRef.close(); }, 3000);
    }

    ngOnInit() {
    }

}
