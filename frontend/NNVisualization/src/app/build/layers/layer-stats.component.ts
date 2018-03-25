import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Layer } from './layer/layer';

@Component({
    selector: 'app-layer-stats',
    templateUrl: 'layer-stats.component.html',
    styleUrls: ['layer-stats.component.css']
})
export class LayerStatsComponent {
    @Input() layer: Layer;
    @Output() nodeUpdate = new EventEmitter();

    constructor() { }

    onNodeUpdate(redraw: boolean) {
        this.nodeUpdate.emit(redraw);
    }
}
