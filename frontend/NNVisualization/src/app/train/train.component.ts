import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

@Component({
    selector: 'app-train',
    templateUrl: './train.component.html',
    styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

    constructor(private restangular: Restangular,
                private selArchService: SelectedArchitectureService) { }

    ngOnInit() {
    }

    onTrain() {
        if (this.selArchService.architecture) {
            const id = this.selArchService.architecture.id;
            this.restangular.all('train_new_model').one(String(id), 1)
                .get().subscribe(
                    (ans) => { console.log(ans); },
                    () => { alert('Error :('); }
                );
        } else {
            alert('No architecture selected');
        }
    }

}
