import { Layer, Activation } from '../layer/layer';

export enum Padding {
    Same,
    Valid
}

export class ConvLayer extends Layer {
    private _filterShape: number[];
    private _strides: number[];
    private _padding: Padding;
    private _activation: Activation;

    constructor(id: number, label: string, input: number[],
                output: number[], filter: number[], strides: number[],
                padding = Padding.Same, activation = Activation.Relu) {
        super(id, label, input, output);

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

}
