import { Component, OnInit } from '@angular/core';
import { VisualizeService } from "./visualize.service";

@Component({
    selector: 'app-visualize',
    templateUrl: './visualize.component.html',
    styleUrls: ['./visualize.component.css'],
    providers: [VisualizeService]

})
export class VisualizeComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
