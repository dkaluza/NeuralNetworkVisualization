import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Layer, Activation } from './layer';

@Component({
    selector: 'app-layer',
    styleUrls: ['./layer.component.css'],
    templateUrl: './layer.component.html'
})
export class LayerComponent {
    @Input() layer: Layer;

    @Output() changed = new EventEmitter();

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

    onChangeLabel(value) {
        this.layer.label = value;
        this.changed.emit(this.layer.id);
    }

    onChangeShape(n: number, value: string): void {
        const last = value[value.length - 1];
        // don't do nothing on ','
        if (last === ',') {
            return;
        }
        // if it is not a digit, delete it
        if (isNaN(parseInt(last, 10))) {
            value = value.substr(0, value.length - 1);
        }
        if (n === 1) { // inputShape
            this.layer.inputShape = this._strToArray(value);
        } else if (n === 2) { // outputShape
            this.layer.outputShape = this._strToArray(value);
        }
    }

    protected _strToArray(value: string) {
        return value.split(',').map(Number);
    }
}
