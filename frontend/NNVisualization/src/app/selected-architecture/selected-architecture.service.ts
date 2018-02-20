import { Injectable } from '@angular/core';
import { Architecture, ArchNode, ArchLink } from './architecture';
import { Model } from './model';

import { Layer } from '../vis-arch/layers/layer/layer';

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

        this._currentNodes = undefined;
        this._currentLinks = undefined;
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
