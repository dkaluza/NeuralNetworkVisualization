import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-log-in-dialog',
    templateUrl: './log-in-dialog.component.html',
    styleUrls: ['./log-in-dialog.component.css']
})
export class LogInDialogComponent implements OnInit {

    username = '';
    password = '';

    constructor(public dialogRef: MatDialogRef<LogInDialogComponent>) { }

    ngOnInit() {
    }

    confirm() {
        this.dialogRef.close({ username: this.username, password: this.password });
    }

}
