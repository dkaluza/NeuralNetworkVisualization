import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { FullyConnectedLayer } from './fully-connected';

@Component({
    selector: 'app-layer-fc',
    styleUrls: ['../layer/layer.component.css', './fully-connected.component.css'],
    templateUrl: './fully-connected.component.html'
})
export class FullyConnectedComponent extends LayerComponent {
    @Input() layer: FullyConnectedLayer;

    onChangeNumOutputs(value: string) {
        this.layer.numOutputs = Number(value);
    }
}
