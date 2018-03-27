import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { DropoutLayer } from './dropout';

@Component({
    selector: 'app-layer-dropout',
    styleUrls: ['../layer/layer.component.css', './dropout.component.css'],
    templateUrl: './dropout.component.html'
})
export class DropoutComponent extends LayerComponent {
    @Input() layer: DropoutLayer;
}
