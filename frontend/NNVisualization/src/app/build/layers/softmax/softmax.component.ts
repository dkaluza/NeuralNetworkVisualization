import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { SoftmaxLayer } from './softmax';

@Component({
    selector: 'app-layer-softmax',
    styleUrls: ['../layer/layer.component.css', './softmax.component.css'],
    templateUrl: './softmax.component.html'
})
export class SoftmaxComponent extends LayerComponent {
    @Input() layer: SoftmaxLayer;
}
