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

    private _patternString =  '^(-1,[ ]?)?(([1-9][0-9]*),[ ]?)*([1-9][0-9]*)$';
    private _pattern = new RegExp(this._patternString);

    shapeFormControl = new FormControl('', [
        Validators.pattern(this._patternString)
    ]);
    inputIdFormControl = new FormControl('', [
        Validators.min(1)
    ]);

    matcher = new LayerErrorStateMatcher();

    onInputIdChange(value: number) {
        if (value >= 1) {
            this.layer.inputId = value;
            this.onChange();
        }
    }

    onShapeChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.shape = value;
            this.onChange();
        }
    }
}
