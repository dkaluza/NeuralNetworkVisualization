import { Injectable } from '@angular/core';
import { Architecture } from './architecture';
import { Model } from './model';


@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;

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
}
