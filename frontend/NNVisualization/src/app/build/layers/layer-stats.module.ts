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
import { AddComponent } from './add/add.component';
import { ConcatComponent } from './concat/concat.component';

import { LayerStatsComponent } from './layer-stats.component';

import { Layer } from './layer/layer';
import { InputLayer } from './input/input';
import { FullyConnectedLayer } from './fully-connected/fully-connected';
import { ConvLayer } from './conv/conv';
import { PoolLayer } from './pool/pool';
import { DropoutLayer } from './dropout/dropout';
import { BatchNormLayer } from './batch-norm/batch-norm';
import { AddLayer } from './add/add';
import { ConcatLayer } from './concat/concat';

import { ArchNode } from '../../selected-architecture/architecture';
import { ToolboxLayer } from '../vis-arch/toolbox-layers';

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
        case 'add':
            return AddLayer.fromDict(node);
        case 'concat':
            return ConcatLayer.fromDict(node);
        default:
            return undefined;
    }
}

function toolboxLayerToLayer(layer: ToolboxLayer, id: number): Layer {
    switch (layer.id) {
        case 'fc':
            return new FullyConnectedLayer(id, layer.shortcut);
        case 'conv':
            return new ConvLayer(id, layer.shortcut);
        case 'input':
            return new InputLayer(id, layer.shortcut);
        case 'pool':
            return new PoolLayer(id, layer.shortcut);
        case 'dropout':
            return new DropoutLayer(id, layer.shortcut);
        case 'batch_norm':
            return new BatchNormLayer(id, layer.shortcut);
        case 'add':
            return new AddLayer(id, layer.shortcut);
        case 'concat':
            return new ConcatLayer(id, layer.shortcut);
    }
}

export { Layer, archNodeToLayer, toolboxLayerToLayer };

@NgModule({
    declarations: [
        LayerComponent,
        InputComponent,
        FullyConnectedComponent,
        ConvComponent,
        PoolComponent,
        DropoutComponent,
        BatchNormComponent,
        AddComponent,
        ConcatComponent,
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
