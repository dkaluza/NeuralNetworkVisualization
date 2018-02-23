import { Layer, Activation } from '../layer/layer';

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
    private _filterShape: number[];
    private _strides: number[];
    private _padding: Padding;
    private _activation: Activation;

    constructor(id: number, label: string, input = [1],
                output = [1], filter = [3, 3], strides = [1],
                padding = Padding.Same, activation = Activation.Relu) {
        super(id, label, 'conv', input, output);

        this._filterShape = filter;
        this._strides = strides;
        this._padding = padding;
        this._activation = activation;
    }

    get filterShape(): number[] {
        return this._filterShape;
    }

    set filterShape(filterShape: number[]) {
        this._filterShape = filterShape;
    }

    get strides(): number[] {
        return this._strides;
    }

    set strides(strides: number[]) {
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
        dict['filterShape'] = this._filterShape;
        dict['strides'] = this._strides;
        dict['padding'] = Padding[this._padding];
        dict['activation'] = Activation[this._activation];
        return dict;
    }
}
