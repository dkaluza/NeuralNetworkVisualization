import { Component, Input } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { ConvLayer, Padding } from './conv';

@Component({
    selector: 'app-layer-conv',
    styleUrls: ['./conv.component.css'],
    templateUrl: './conv.component.html'
})
export class ConvComponent extends LayerComponent {
    @Input() layer: ConvLayer;

    paddings = [
        {
            'value': Padding.Same,
            'viewValue': Padding[Padding.Same]
        }, {
            'value': Padding.Valid,
            'viewValue': Padding[Padding.Valid]
        }
    ];

    onChangeFilterShape(value: string): void {
        const last = value[value.length - 1];
        // don't do nothing on ','
        if (last === ',') {
            return;
        }
        // if it is not a digit, delete it
        if (isNaN(parseInt(last, 10))) {
            value = value.substr(0, value.length - 1);
        }
        this.layer.filterShape = this._strToArray(value);

    }

    onChangeStrides(value: string): void {
        const last = value[value.length - 1];
        // don't do nothing on ','
        if (last === ',') {
            return;
        }
        // if it is not a digit, delete it
        if (isNaN(parseInt(last, 10))) {
            value = value.substr(0, value.length - 1);
        }
        this.layer.strides = this._strToArray(value);
    }
}
