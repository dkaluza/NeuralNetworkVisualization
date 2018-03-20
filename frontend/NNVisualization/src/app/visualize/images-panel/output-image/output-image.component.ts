import { Component, OnInit } from '@angular/core';
import {VisualizeService} from "../../visualize.service";
import {Image} from "../../image.model";

@Component({
    selector: 'app-output-image',
    templateUrl: './output-image.component.html',
    styleUrls: ['./output-image.component.css']
})
export class OutputImageComponent implements OnInit {
    constructor(private visualizeService: VisualizeService) { }

    ngOnInit() {
    }

}
