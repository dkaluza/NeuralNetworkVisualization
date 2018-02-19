import { Layer, Activation } from '../layer/layer';

export class FullyConnectedLayer extends Layer {
    _activation: Activation;

    constructor(id: number, label: string,
                input: number[], output: number[],
                activation = Activation.Relu) {
        super(id, label, input, output);

        this._activation = activation;
    }

    get activation(): Activation {
        return this._activation;
    }

    set activation(activation: Activation) {
        this._activation = activation;
    }

    get activationString(): string {
        return Activation[this._activation];
    }
}
