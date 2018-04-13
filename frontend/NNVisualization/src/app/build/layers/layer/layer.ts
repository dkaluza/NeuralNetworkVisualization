import { ArchNode } from '../../../selected-architecture/architecture';

export abstract class Layer {
    private _id: number;
    private _label: string;
    private _layerType: string;
    private _shareWeightsFrom: number;

    protected _inputShapes: number[][];

    constructor(id: number, label: string, layerType: string,
                shareFrom?: number) {
        this._id = id;
        this._label = label;
        this._layerType = layerType;
        this._shareWeightsFrom = shareFrom;
        this._inputShapes = undefined;
    }

    get id(): number {
        return this._id;
    }

    get layerType(): string {
        return this._layerType;
    }

    get label(): string {
        return this._label;
    }

    set label(label: string) {
        this._label = label;
    }

    get shareWeightsFrom(): number {
        return this._shareWeightsFrom;
    }

    set shareWeightsFrom(id: number) {
        this._shareWeightsFrom = id;
    }

    get inputShapes(): number[][] {
        return this._inputShapes;
    }

    set inputShapes(shapes: number[][]) {
        this._inputShapes = shapes;
    }

    abstract addAttributes(dict);

    // default is that you can't share weights
    //     needs to be overwritten to share weights
    canShareWeightFrom(layer: Layer): boolean {
        return false;
    }

    // assumes that value is already valid number array
    strToArray(value: string): number[] {
        return value.split(',').map(Number);
    }

    toDict(): ArchNode {
        const dict = {
            id: String(this._id),
            label: this._label,
            layerType: this._layerType,
            shareWeightsFrom: 0,
            params: {
            }
        };
        if (this._shareWeightsFrom) {
            dict.shareWeightsFrom = this._shareWeightsFrom;
        }
        dict.params = this.addAttributes(dict.params);
        return dict;
    }

    // returns minimal number of inputs to the layere
    //    if there is no limit returns undefined
    abstract getMinNumOfInputs(): number;

    // returns maximal number of inputs to the layere
    //    if there is no limit returns undefined
    abstract getMaxNumOfInputs(): number;

    abstract calculateOutputShape(shapes: number[][]): number[];

    abstract validateInputShapes(shapes: number[][]): boolean;
}

export enum Activation {
    None,
    Relu,
    Sigmoid,
}

export function StrToActivation(str: string): Activation {
    switch (str) {
        case 'None':
            return Activation.None;
        case 'Relu':
            return Activation.Relu;
        case 'Sigmoid':
            return Activation.Sigmoid;
        default:
            return Activation.None;
    }
}
