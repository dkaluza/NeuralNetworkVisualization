export abstract class Layer {
    private _id: number;
    private _outputLayers: Layer[];

    constructor(id: number, outputLayers: Layer[]) {
        this._id = id;
        this._outputLayers = outputLayers;
    }

    get outputLayers(): Layer[] {
        return this._outputLayers;
    }

    addOutputLayer(layer: Layer): void {
        this._outputLayers.push(layer);
    }

    removeLayer(index: number): Layer {
        let removedLayer: Layer = this._outputLayers[index];
        this._outputLayers[index] = this._outputLayers[this._outputLayers.length - 1];
        this._outputLayers.pop();
        return removedLayer;
    }
}
