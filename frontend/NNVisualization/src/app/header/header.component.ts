import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LogInDialogComponent } from "./log-in-dialog/log-in-dialog.component"


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    public logged: Boolean = false;

    @ViewChild('toolbar')
    private toolbar: ElementRef;

    constructor(private dialog: MatDialog) { }

    ngOnInit() {
    }

    public logIn() {
        let username: string;
        let password: string;

        console.log(this.toolbar);

        let dialogRef = this.dialog.open(LogInDialogComponent, {
            width: '250px',
            position: { right: "0%", top: this.toolbar.nativeElement.offsetHeight + "px" },
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            this.logged = true;
        });
    }

    public logOut() {
        this.logged = false;
    }
}
