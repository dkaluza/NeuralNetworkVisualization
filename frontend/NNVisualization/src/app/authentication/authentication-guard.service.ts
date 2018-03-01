import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuardService implements CanActivate {

    constructor(private auth: AuthenticationService, private router: Router) { }

    canActivate(): boolean {
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['unauthorized']);
            return false;
        }

        return true;
    }

}
