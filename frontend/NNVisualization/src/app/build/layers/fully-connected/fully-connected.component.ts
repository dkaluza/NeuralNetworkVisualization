import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { FullyConnectedLayer } from './fully-connected';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-fc',
    styleUrls: ['../layer/layer.component.css', './fully-connected.component.css'],
    templateUrl: './fully-connected.component.html'
})
export class FullyConnectedComponent extends LayerComponent {
    @Input() layer: FullyConnectedLayer;

    numOutputsControl = new FormControl('', [
        Validators.min(1)
    ]);

    matcher = new LayerErrorStateMatcher();

    onNumOutputsChange(value) {
        if (value === null) {
            return;
        }
        if (1 <= value) {
            this.layer.numOutputs = value;
            this.onChange();
        }
    }
}
