import { Component, Input } from '@angular/core';
import { LayerComponent, LayerErrorStateMatcher } from '../layer/layer.component';
import { BatchNormLayer } from './batch_norm';

@Component({
    selector: 'app-layer-batch-norm',
    styleUrls: ['../layer/layer.component.css', './batch_norm.component.css'],
    templateUrl: './batch_norm.component.html'
})
export class BatchNormComponent extends LayerComponent {
    @Input() layer: BatchNormLayer;
}
