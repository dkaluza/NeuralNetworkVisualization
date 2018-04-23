export abstract class Layer {
    private _id: number;
    private _label: string;
    private _layerType: string;

    constructor(id: number, label: string, layerType: string) {
        this._id = id;
        this._label = label;
        this._layerType = layerType;
    }

    ngOnInit() {
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

    abstract addAttributes(dict);

    // assumes that value is already valid number array
    strToArray(value: string): number[] {
        return value.split(',').map(Number);
    }

    toDict() {
        const dict = {
            id: String(this._id),
            label: this._label,
            layerType: this._layerType,
            params: {
            }
        };
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
