import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import * as io from 'socket.io-client';

@Injectable()
export class IOSocketService {

    constructor(private authService: AuthenticationService) { }

    newSocket(url: string, id?: number): any {
        return io(location.host + '/' + url, {
            path: '/api/socketio',
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: 'Bearer ' + this.authService.getToken()
                    }
                }
            },
            query: {
                id: id
            },
            forceNew: true // TODO: check if multiplexing works in new versions of flask_socketio
        });
    }
}
