import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { DropoutLayer } from './dropout';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-dropout',
    styleUrls: ['../layer/layer.component.css', './dropout.component.css'],
    templateUrl: './dropout.component.html'
})
export class DropoutComponent extends LayerComponent {
    @Input() layer: DropoutLayer;

    keepProbFormControl = new FormControl('', [
        Validators.min(0), Validators.max(1)
    ]);

    matcher = new LayerErrorStateMatcher();

    onKeepProbChange(value: number) {
        if (value === null) {
            return;
        }
        if (0 <= value && value <= 1) {
            this.layer.keepProb = value;
            this.onChange();
        }
    }
}
