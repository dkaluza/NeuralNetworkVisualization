import { Layer } from 'layer'

export class Architecture {
  private _id: number;
  private _name: string;
  private _layers: Layer[];

  constructor(id: number, name: string, layers: Layer[]) {
    this._id = id;
    this._name = name;
    this._layers = layers; // maybe should be a deep copy?
  }

  get name(): string {
    return this._name;
  }

  get id(): number {
    return this._id;
  }

  // any more functions?
}
