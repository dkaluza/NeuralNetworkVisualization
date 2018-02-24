import { Layer, Activation, StrToActivation } from '../layer/layer';

export class FullyConnectedLayer extends Layer {
    private _activation: Activation;
    private _numOutputs: number;


    constructor(id: number, label: string,
                input = '1', numOutputs = 1,
                activation = Activation.Relu) {
        super(id, label, 'fc', input, String(numOutputs));

        this._activation = activation;
        this._numOutputs = numOutputs;
    }

    static fromDict(dict): FullyConnectedLayer {
        return new FullyConnectedLayer(
            dict.id, dict.label,
            dict.params.inputShape,
            dict.params.numOutputs,
            StrToActivation(dict.params.activation)
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
}
