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

    kernelShapeFormControl = new FormControl('', [
        Validators.pattern('([0-9]+,)*([0-9]+)')
    ]);

    stridesFormControl = new FormControl('', [
        Validators.pattern('([0-9]+,)*([0-9]+)')
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

    private _pattern = new RegExp('^([0-9]+,)*([0-9]+)$');

    onKernelShapeChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.kernelShape = value;
        }
    }

    onStridesChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.strides = value;
        }
    }
}
