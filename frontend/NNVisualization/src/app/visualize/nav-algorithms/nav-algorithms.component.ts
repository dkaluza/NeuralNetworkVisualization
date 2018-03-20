import { Component, OnInit } from '@angular/core';
import {VisualizeService} from '../visualize.service';

@Component({
    selector: 'app-nav-algorithms',
    templateUrl: './nav-algorithms.component.html',
    styleUrls: ['./nav-algorithms.component.css']
})
export class NavAlgorithmsComponent implements OnInit {

    constructor(public visualizeService: VisualizeService) { }

    ngOnInit() { }

    onSelectorSelect(event) {
        this.visualizeService.currentAlgorithm = event.value;
    }
}
