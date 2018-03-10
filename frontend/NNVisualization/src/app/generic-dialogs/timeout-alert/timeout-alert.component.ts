import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-timeout-alert',
    templateUrl: './timeout-alert.component.html',
    styleUrls: ['./timeout-alert.component.css']
})
export class TimeoutAlertComponent implements OnInit {

    constructor(private dialogRef: MatDialogRef<TimeoutAlertComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }) {
        setTimeout(() => { this.dialogRef.close(); }, 3000);
    }

    ngOnInit() {
    }

}
