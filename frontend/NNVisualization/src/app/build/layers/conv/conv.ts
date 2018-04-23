import { Layer, Activation, StrToActivation } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export enum Padding {
    Same,
    Valid
}

export function StrToPadding(str: string): Padding {
    switch (str) {
        case 'Same':
            return Padding.Same;
        case 'Valid':
            return Padding.Valid;
        default:
            return Padding.Same;
    }
}

export class ConvLayer extends Layer {
    private _numFilters: number;
    private _kernelShape: string;
    private _strides: string;
    private _padding: Padding;
    private _activation: Activation;

    constructor(id: number, label: string,
                numFilters = 1, kernelShape = '3, 3', strides = '1, 1',
                padding = Padding.Same, activation = Activation.Relu) {
        super(id, label, 'conv');

        this._numFilters = numFilters;
        this._kernelShape = kernelShape;
        this._strides = strides;
        this._padding = padding;
        this._activation = activation;
    }

    static fromDict(dict: ArchNode): ConvLayer {
        return new ConvLayer(
            Number(dict.id), dict.label,
            dict.params.numFilters,
            String(dict.params.kernelShape),
            String(dict.params.strides),
            StrToPadding(dict.params.padding),
            StrToActivation(dict.params.activation)
        );
    }

    get numFilters(): number {
        return this._numFilters;
    }

    set numFilters(numFilters: number) {
        this._numFilters = numFilters;
    }

    get kernelShape(): string {
        return this._kernelShape;
    }

    set kernelShape(kernelShape: string) {
        this._kernelShape = kernelShape;
    }

    get strides(): string {
        return this._strides;
    }

    set strides(strides: string) {
        this._strides = strides;
    }

    get padding(): Padding {
        return this._padding;
    }

    set padding(padding: Padding) {
        this._padding = padding;
    }

    get activation(): Activation {
        return this._activation;
    }

    set activation(activation: Activation) {
        this._activation = activation;
    }

    addAttributes(dict) {
        dict['numFilters'] = this._numFilters;
        dict['kernelShape'] = this.strToArray(this._kernelShape);
        dict['strides'] = this.strToArray(this._strides);
        dict['padding'] = Padding[this._padding];
        dict['activation'] = Activation[this._activation];
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
        const strides = this.strToArray(this._strides);
        const output = [shape[0]];
        for (let i = 0; i < strides.length; i += 1) {
            let dim = 0;
            if (this._padding === Padding.Same) {
                dim = shape[i + 1] / strides[i];
            } else { // this._padding === Padding.Valid
                dim = (shape[i + 1] - strides[i] + 1) / strides[i];
            }
            output.push(Math.ceil(dim));
        }
        output.push(this._numFilters);
        return output;
    }

    validateInputShapes(shapes: number[][]): boolean {
        if (shapes.length !== 1) {
            return false;
        }
        const shape = shapes[0];
        if (shape.length < 3 || shape.length > 5) {
            return false;
        }
        const strides = this.strToArray(this._strides);
        const kernel = this.strToArray(this._kernelShape);
        if (shape.length !== strides.length + 2 ||
            shape.length !== kernel.length + 2) {
            return false;
        }
        return true;
    }
}
