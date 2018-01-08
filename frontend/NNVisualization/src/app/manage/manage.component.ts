import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service'
import { Component, OnInit, Inject } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

    architectures: string[] = [];
    models: string[] = [];
    popup: boolean = false

    constructor(private selectedArchitectureService: SelectedArchitectureService,
                private restangular: Restangular) {
    }

    ngOnInit() {
        this.restangular.all('listarchs')
            .getList().subscribe(_architectures => {
                this.architectures = _architectures;
            });
    }

    addNewArchitecture() {
        this.popup = true
    }

    saveNewArchitecture(n, d) {
        if (n == "" || d == "") {
            return;
        }
        console.log("Name: " + n +
            " , Description: " + d);
        this.popup = false;
    }

    selectArchitecture(id) {
        console.log("You have selected architecture: " + id);
        this.restangular.one('listmodels', id)
            .getList().subscribe(_models => {
                this.models = _models;
            });
    }

    selectModel(id) {
        // TODO: selecting model
        console.log("You have selected model: " + id);
    }
}
