import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { FullyConnectedLayer } from './fully-connected';
import { Activation } from '../layer/layer';

@Component({
    selector: 'app-layer-fc',
    styleUrls: ['./fully-connected.component.css'],
    templateUrl: './fully-connected.component.html'
})
export class FullyConnectedComponent extends LayerComponent {
    @Input() layer: FullyConnectedLayer;

    activations = [
        {
            value: Activation.None,
            viewValue: Activation[Activation.None]
        }, {
            value: Activation.Relu,
            viewValue: Activation[Activation.Relu]
        }, {
            value: Activation.Sigmoid,
            viewValue: Activation[Activation.Sigmoid]
        }
    ];
}
