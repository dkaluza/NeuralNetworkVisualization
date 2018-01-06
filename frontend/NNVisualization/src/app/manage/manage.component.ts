import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service'
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

    constructor(private selectedArchitectureService: SelectedArchitectureService,
                private restangular: Restangular) {
    }

    ngOnInit() {
    }

}
