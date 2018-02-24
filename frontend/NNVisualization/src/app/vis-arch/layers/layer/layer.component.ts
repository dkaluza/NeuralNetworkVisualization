import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Layer, Activation } from './layer';

import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class LayerErrorStateMatcher implements ErrorStateMatcher {
      isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
          const isSubmitted = form && form.submitted;
          return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
      }
}

@Component({
    selector: 'app-layer',
    styleUrls: ['./layer.component.css'],
    templateUrl: './layer.component.html'
})
export class LayerComponent {
    @Input() layer: Layer;

    @Output() changed = new EventEmitter();

    labelFormControl = new FormControl('', [
        Validators.pattern('.{1,}')
    ]);

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
        // this.layer.label = value;
        this.changed.emit(this.layer.id);
    }
}
