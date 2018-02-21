import { Injectable } from '@angular/core';
import { Architecture, ArchNode, ArchLink } from './architecture';
import { Model } from './model';


@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;

    private _currentNodes: ArchNode[];
    private _currentLinks: ArchLink[];

    constructor() { }

    get architecture(): Architecture {
        return this._architecture;
    }

    set architecture(newArchitecture: Architecture) {
        this._architecture = newArchitecture;
        this._model = undefined;
    }

    get model(): Model {
        return this._model;
    }

    set model(newModel: Model) {
        this._model = newModel;
    }

    get currentNodes(): ArchNode[] {
        return this._currentNodes;
    }

    set currentNodes(newNodes: ArchNode[]) {
        this._currentNodes = newNodes;
    }

    get currentLinks(): ArchLink[] {
        return this._currentLinks;
    }

    set currentLinks(newLinks: ArchLink[]) {
        this._currentLinks = newLinks;
    }
}
