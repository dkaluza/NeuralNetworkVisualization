import { Injectable } from '@angular/core';
import { Architecture, ArchNode, ArchLink } from './architecture';
import { Model } from './model';

import { Layer } from '../vis-arch/layers/layer/layer';

import { FullyConnectedLayer } from '../vis-arch/layers/fully-connected/fully-connected';
import { ConvLayer } from '../vis-arch/layers/conv/conv';
import { InputLayer } from '../vis-arch/layers/input/input';

@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;

    private _currentNodes: Map<number, Layer>;
    private _currentLinks: ArchLink[];

    constructor() { }

    get architecture(): Architecture {
        return this._architecture;
    }

    set architecture(newArchitecture: Architecture) {
        this._architecture = newArchitecture;
        this._model = undefined;

        if (this._architecture) {
            this._currentNodes = new Map;
            this._architecture.nodes.forEach(
                node => {
                    return this._currentNodes.set(
                                Number(node.id),
                                this._archNodeToLayer(node));
                }
            );
            this._currentLinks = this._architecture.links;
        }
    }

    private _archNodeToLayer(node: ArchNode): Layer {
        switch (node.layerType) {
            case 'fc':
                return FullyConnectedLayer.fromDict(node);
            case 'conv':
                return ConvLayer.fromDict(node);
            case 'input':
                return InputLayer.fromDict(node);
            default:
                return undefined;
        }
    }

    get model(): Model {
        return this._model;
    }

    set model(newModel: Model) {
        this._model = newModel;
    }

    get currentNodes(): Map<number, Layer> {
        return this._currentNodes;
    }

    set currentNodes(newNodes: Map<number, Layer>) {
        this._currentNodes = newNodes;
    }

    get currentLinks(): ArchLink[] {
        return this._currentLinks;
    }

    set currentLinks(newLinks: ArchLink[]) {
        this._currentLinks = newLinks;
    }

    currentNodesToDict(): ArchNode[] {
        const ret = [];
        this._currentNodes.forEach(
            (node) => { ret.push(node.toDict()); }
        );
        return ret;
    }
}
