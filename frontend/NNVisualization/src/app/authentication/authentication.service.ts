import { Injectable } from '@angular/core';
import { JwtHelperService as JwtHelper } from '@auth0/angular-jwt';
import { Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs/Observable';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

@Injectable()
export class AuthenticationWithoutLoginService {
    protected _tokenPath = 'token';

    constructor(protected jwtHelper: JwtHelper,
            private selArchService: SelectedArchitectureService) {

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
        // unselect current architecture and model
        this.selArchService.architecture = undefined;
    }

}

@Injectable()
export class AuthenticationService extends AuthenticationWithoutLoginService {


    constructor(jwtHelper: JwtHelper, private restangular: Restangular,
            selArchService: SelectedArchitectureService) {
        super(jwtHelper, selArchService);
    }

    public logIn(username: string, password: string): Observable<void> {
        return this.restangular.all('authenticate')
            .post({ username: username, password: password })
            .map(response => {
                localStorage.setItem(this._tokenPath, response.access_token);
            });
    }
}
