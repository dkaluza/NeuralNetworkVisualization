import { Layer, Activation, StrToActivation } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

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

    static fromDict(dict: ArchNode): FullyConnectedLayer {
        return new FullyConnectedLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
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
}
