import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

    archNames: String[] = [];
    archIds: Number[] = [];

    modelNames: String[] = [];
    modelIds: Number[] = [];

    constructor(private restangular: Restangular) {
    }

    ngOnInit() {
    }

}
