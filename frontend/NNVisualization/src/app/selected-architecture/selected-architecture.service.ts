import { Injectable } from '@angular/core';
import { Architecture, ArchNode, ArchLink } from './architecture';
import { Model } from './model';

import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;

    constructor(private genericDialogs: GenericDialogsService) { }

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
