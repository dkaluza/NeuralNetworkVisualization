import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { InputLayer } from './input';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-input',
    styleUrls: ['../layer/layer.component.css', './input.component.css'],
    templateUrl: './input.component.html'
})
export class InputComponent extends LayerComponent {
    @Input() layer: InputLayer;

    shapeFormControl = new FormControl('', [
        Validators.pattern('((-1,)|([0-9]+,))*((-1)|([0-9]+))')
    ]);

    matcher = new LayerErrorStateMatcher();

    private _pattern = new RegExp('^((-1,)|([0-9]+,))*((-1)|([0-9]+))$');

    onShapeChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.outputShape = value;
        }
    }
}
