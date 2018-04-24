import { Layer, Activation, StrToActivation } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class FullyConnectedLayer extends Layer {
    private _activation: Activation;
    private _numOutputs: number;


    constructor(id: number, label: string,
                numOutputs = 1,
                activation = Activation.Relu,
                shareWeightsFrom?: number) {
        super(id, label, 'fc', shareWeightsFrom);

        this._activation = activation;
        this._numOutputs = numOutputs;
    }

    static fromDict(dict: ArchNode): FullyConnectedLayer {
        return new FullyConnectedLayer(
            Number(dict.id), dict.label,
            dict.params.numOutputs,
            StrToActivation(dict.params.activation),
            Number(dict.shareWeightsFrom)
        );
    }

    get activation(): Activation {
        return this._activation;
    }

    set activation(activation: Activation) {
        this._activation = activation;
    }

    get numOutputs(): number {
        return this._numOutputs;
    }

    set numOutputs(value: number) {
        this._numOutputs = value;
    }

    addAttributes(dict) {
        dict['activation'] = Activation[this._activation];
        dict['numOutputs'] = this._numOutputs;
        return dict;
    }

    getMinNumOfInputs(): number {
        return 1;
    }

    getMaxNumOfInputs(): number {
        return 1;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        const shape = shapes[0];
        return [shape[0], this._numOutputs];
    }

    validateInputShapes(shapes: number[][]): boolean {
        return shapes.length === 1;
    }

    canShareWeightFrom(layer: Layer): boolean {
        if (!layer) {
            return false;
        }

        if (layer.layerType !== 'fc') {
            return false;
        }
        const fclayer = layer as FullyConnectedLayer;

        if (this._numOutputs !== fclayer.numOutputs) {
            return false;
        }

        let thisInputSize = 1, layerInputSize = 1;
        for (let i = 1; i < this._inputShapes[0].length; i += 1) {
            thisInputSize *= this._inputShapes[0][i];
        }
        for (let i = 1; i < fclayer.inputShapes[0].length; i += 1) {
            layerInputSize *= fclayer.inputShapes[0][i];
        }
        if (thisInputSize !== layerInputSize) {
            return false;
        }

        return true;
    }
}
