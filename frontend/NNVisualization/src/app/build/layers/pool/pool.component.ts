import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { PoolLayer, Pool } from './pool';
import { Padding } from '../conv/conv';

import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-layer-pool',
    styleUrls: ['../layer/layer.component.css', './pool.component.css'],
    templateUrl: './pool.component.html'
})
export class PoolComponent extends LayerComponent {
    @Input() layer: PoolLayer;

    private _patternString = '^[1-9][0-9]*,[ ]?[1-9][0-9]*$';
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

    pools = [
        {
            'value': Pool.Max,
            'viewValue': Pool[Pool.Max]
        }, {
            'value': Pool.Avarage,
            'viewValue': Pool[Pool.Avarage]
        }
    ];

    onKernelShapeChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.kernelShape = value;
            this.onChange();
        }
    }

    onStridesChange(value: string) {
        if (this._pattern.test(value)) {
            this.layer.strides = value;
            this.onChange();
        }
    }
}
