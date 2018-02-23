import { Layer, Activation } from '../layer/layer';

export class FullyConnectedLayer extends Layer {
    _activation: Activation;

    constructor(id: number, label: string,
                input = [1], output: number[] = [1],
                activation = Activation.Relu) {
        super(id, label, 'fc', input, output);

        this._activation = activation;
    }

    get activation(): Activation {
        return this._activation;
    }

    set activation(activation: Activation) {
        this._activation = activation;
    }

    addAttributes(dict) {
        dict['activation'] = Activation[this._activation];
        return dict;
    }
}
