import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { ConvLayer, Padding } from './conv';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-conv',
    styleUrls: ['../layer/layer.component.css', './conv.component.css'],
    templateUrl: './conv.component.html'
})
export class ConvComponent extends LayerComponent {
    @Input() layer: ConvLayer;

    private _patternString = '^([0-9]+,[ ]?)*([0-9]+)$';
    private _pattern = new RegExp(this._patternString);

    kernelShapeFormControl = new FormControl('', [
        Validators.pattern(this._patternString)
    ]);

    stridesFormControl = new FormControl('', [
        Validators.pattern(this._patternString)
    ]);

    matcher = new LayerErrorStateMatcher();

    paddings = [
        {
            'value': Padding.Same,
            'viewValue': Padding[Padding.Same]
        }, {
            'value': Padding.Valid,
            'viewValue': Padding[Padding.Valid]
        }
    ];

    onKernelShapeChange(value: string) {
        if (this._pattern.test(value)) {
            console.log(value);
            this.layer.kernelShape = value;
        }
    }

    onStridesChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.strides = value;
        }
    }
}
