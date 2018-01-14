import { Injectable } from '@angular/core';
import { Architecture } from './architecture';
import { Model } from './model';


@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;
    header: string  = "Select model and architecture";

    constructor() { }

    get architecture(): Architecture {
        return this._architecture;
    }

    set architecture(newArchitecture: Architecture) {
        this._architecture =  newArchitecture;
        this.updateHeader();
    }

    get model(): Model {
        return this._model;
    }

    set model(newModel: Model) {
        this._model = newModel;
        this.updateHeader();
    }

    private updateHeader(): void {
        this.header =  "Architecture " + this._architecture.name +
        ", Model " + this._model.name;
    }

}
