import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { AddLayer } from './add';

@Component({
    selector: 'app-layer-add',
    styleUrls: ['../layer/layer.component.css', './add.component.css'],
    templateUrl: './add.component.html'
})
export class AddComponent extends LayerComponent {
    @Input() layer: AddLayer;
}
