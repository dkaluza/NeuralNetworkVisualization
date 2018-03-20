import { Component, OnInit } from '@angular/core';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    constructor(public selArchService: SelectedArchitectureService) {
    }

    ngOnInit() {
    }

}
