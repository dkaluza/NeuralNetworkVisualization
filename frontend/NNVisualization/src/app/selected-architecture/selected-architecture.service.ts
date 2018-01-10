import { Injectable } from '@angular/core';
import { Architecture } from 'architecture';
import { Model } from 'model';


@Injectable()
export class SelectedArchitectureService {

  private _architecture: Architecture;
  private _model: Model;
  header: string  = "Select model and architecture";

  constructor() { }

  get architecture(): Architecture {
      return this._architecture;
  }

  set architecture(newArchitecture: Architecture): void {
    this._architecture =  newArchitecture;
    updateHeader();
  }

  get model(): Model {
    return this._model;
  }

  set model(newModel: Model): void {
    this._model = newModel;
    updateHeader();
  }

  private updateHeader(): string {
      header =  "Architecture " + this._architecture.name() +
      ", Model " + this._model.name();
  }

}
