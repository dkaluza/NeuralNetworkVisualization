import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt'

@Injectable()
export class AuthenticationService {

    constructor(private jwtHelper: JwtHelper) { }

    public isAuthenticated(): boolean {
        const token = localStorage.getItem('token');

        return token ? !this.jwtHelper.isTokenExpired(token) : false;
    }

    public logIn(username: string, password: string): boolean {
        // TODO
        return true;
    }

    public logOut() {
        localStorage.removeItem('token');
    }

}
