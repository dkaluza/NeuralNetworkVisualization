import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { BatchNormLayer } from './batch-norm';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-batch-norm',
    styleUrls: ['../layer/layer.component.css', './batch-norm.component.css'],
    templateUrl: './batch-norm.component.html'
})
export class BatchNormComponent extends LayerComponent {
    @Input() layer: BatchNormLayer;

    decayFormControl = new FormControl('', [
        Validators.min(0), Validators.max(1)
    ]);

    matcher = new LayerErrorStateMatcher();

    onDecayChange(value) {
        if (value === null) {
            return;
        }
        if (0 <= value && value <= 1) {
            this.layer.decay = value;
        }
    }
}
