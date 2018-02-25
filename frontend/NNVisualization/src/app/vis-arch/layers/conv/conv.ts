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

    constructor(id: number, label: string, input = '1',
                numFilters = 1, kernelShape = '3, 3', strides = '1, 1',
                padding = Padding.Same, activation = Activation.Relu) {
        super(id, label, 'conv', input, String(numFilters));

        this._numFilters = numFilters;
        this._kernelShape = kernelShape;
        this._strides = strides;
        this._padding = padding;
        this._activation = activation;
    }

    static fromDict(dict: ArchNode): ConvLayer {
        return new ConvLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
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
}
