import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LogInDialogComponent } from "./log-in-dialog/log-in-dialog.component"
import { AuthenticationService } from "../authentication/authentication.service"
import { Router } from '@angular/router';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    @ViewChild('toolbar')
    private toolbar: ElementRef;

    constructor(private dialog: MatDialog, public auth: AuthenticationService,
        private router: Router) { }

    ngOnInit() {
    }

    public logIn() {
        let username: string;
        let password: string;

        let dialogRef = this.dialog.open(LogInDialogComponent, {
            width: '250px',
            position: { right: "0%", top: this.toolbar.nativeElement.offsetHeight + "px" },
        });

        dialogRef.afterClosed().subscribe(
            (result: { username: string, password: string }) => {
                if (result) {
                    this.auth.logIn(result.username, result.password).subscribe(
                        () => {
                            this.refreshRouter();
                        },
                        error => {
                            // TODO error popup
                            console.log(error);
                        }
                    );
                }
            });
    }

    private refreshRouter() {
        this.router.navigateByUrl("/").then(
            () => { },
            error => {
                console.log(error);
            }
        )
    }

    public logOut() {
        this.auth.logOut();
        this.refreshRouter();
    }
}
