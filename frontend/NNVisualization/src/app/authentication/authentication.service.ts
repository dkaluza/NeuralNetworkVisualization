import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';
import { Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthenticationWithoutLoginService {
    protected _tokenPath = 'token';

    constructor(protected jwtHelper: JwtHelper) {

    }

    public getToken(): string {
        return localStorage.getItem(this._tokenPath);
    }



    public isAuthenticated(): boolean {
        const token = this.getToken();

        if (token) {
            if (this.jwtHelper.isTokenExpired(token)) {
                this.logOut();
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public logOut() {
        localStorage.removeItem(this._tokenPath);
    }

}

@Injectable()
export class AuthenticationService extends AuthenticationWithoutLoginService {


    constructor(jwtHelper: JwtHelper, private restangular: Restangular) {
        super(jwtHelper);
    }

    public logIn(username: string, password: string): Observable<void> {
        return this.restangular.all('authenticate')
            .post({ username: username, password: password })
            .map(response => {
                localStorage.setItem(this._tokenPath, response.access_token);
            });
    }
}
