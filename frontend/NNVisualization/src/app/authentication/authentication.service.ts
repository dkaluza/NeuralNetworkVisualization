import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt'
import { Restangular } from 'ngx-restangular';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class AuthenticationService {

    constructor(private jwtHelper: JwtHelper, private restangular: Restangular) { }

    public getToken(): string {
        return localStorage.getItem('token');
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();

        return token ? !this.jwtHelper.isTokenExpired(token) : false;
    }

    public logIn(username: string, password: string): Observable<boolean> {
        return this.restangular.all('authentiacate')
            .post({ username: username, password: password })
            .map(response => {
                localStorage.setItem('token', response);
                this.restangular.withConfig(restangularConfigurer => {
                    restangularConfigurer
                        .setDefaultHeaders({ 'Authorization': 'Bearer ' + this.getToken() })
                });
                return true;
            });
    }

    public logOut() {
        localStorage.removeItem('token');
        this.restangular.withConfig(restangularConfigurer => {
            restangularConfigurer.setDefaultHeaders({})
        });
    }

}
