import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { ConcatLayer } from './concat';

@Component({
    selector: 'app-layer-concat',
    styleUrls: ['../layer/layer.component.css', './concat.component.css'],
    templateUrl: './concat.component.html'
})
export class ConcatComponent extends LayerComponent {
    @Input() layer: ConcatLayer;
}
