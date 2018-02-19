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

    change(value) {
        this.layer.label = value;
        this.changed.emit(this.layer.id);
    }
}
