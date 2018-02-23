import { Component, Input, OnInit } from '@angular/core';
import { LayerComponent } from '../layer/layer.component';
import { InputLayer } from './input';

@Component({
    selector: 'app-layer-input',
    styleUrls: ['../layer/layer.component.css', './input.component.css'],
    templateUrl: './input.component.html'
})
export class InputComponent extends LayerComponent {
    @Input() layer: InputLayer;
}
