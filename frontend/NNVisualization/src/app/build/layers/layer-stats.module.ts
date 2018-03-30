import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialImportsModule } from '../../material-imports.module';

import { LayerComponent } from './layer/layer.component';
import { InputComponent } from './input/input.component';
import { FullyConnectedComponent } from './fully-connected/fully-connected.component';
import { ConvComponent } from './conv/conv.component';
import { PoolComponent } from './pool/pool.component';
import { DropoutComponent } from './dropout/dropout.component';
import { BatchNormComponent } from './batch-norm/batch-norm.component';

import { LayerStatsComponent } from './layer-stats.component';

import { Layer } from './layer/layer';
import { InputLayer } from './input/input';
import { FullyConnectedLayer } from './fully-connected/fully-connected';
import { ConvLayer } from './conv/conv';
import { PoolLayer } from './pool/pool';
import { DropoutLayer } from './dropout/dropout';
import { BatchNormLayer } from './batch-norm/batch-norm';

import { ArchNode } from '../../selected-architecture/architecture';

function archNodeToLayer(node: ArchNode): Layer {
    switch (node.layerType) {
        case 'fc':
            return FullyConnectedLayer.fromDict(node);
        case 'conv':
            return ConvLayer.fromDict(node);
        case 'input':
            return InputLayer.fromDict(node);
        case 'pool':
            return PoolLayer.fromDict(node);
        case 'dropout':
            return DropoutLayer.fromDict(node);
        case 'batch_norm':
            return BatchNormLayer.fromDict(node);
        default:
            return undefined;
    }
}

export { Layer, archNodeToLayer };

@NgModule({
    declarations: [
        LayerComponent,
        InputComponent,
        FullyConnectedComponent,
        ConvComponent,
        PoolComponent,
        DropoutComponent,
        BatchNormComponent,
        LayerStatsComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialImportsModule
    ],
    exports: [LayerStatsComponent]
})
export class LayerStatsModule { }
