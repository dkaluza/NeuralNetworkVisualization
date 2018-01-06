import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

    architectures: String[] = [];
    models: String[] = [];

    constructor(private restangular: Restangular) {
    }

    ngOnInit() {
        this.restangular.all('listarchs')
            .getList().subscribe(_architectures => {
                this.architectures = _architectures;
            });
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
