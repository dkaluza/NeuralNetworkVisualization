export abstract class Layer {
    private _id: number;
    private _label: string;
    private _layerType: string;

    private _inputShape: string;
    private _outputShape: string;

    constructor(id: number, label: string, layerType: string,
                input: string, output: string) {
        this._id = id;
        this._label = label;
        this._layerType = layerType;
        this._inputShape = input;
        this._outputShape = output;
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

    get inputShape(): string {
        return this._inputShape;
    }

    set inputShape(input: string) {
        this._inputShape = input;
    }

    get outputShape(): string {
        return this._outputShape;
    }

    set outputShape(output: string) {
        this._outputShape = output;
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
                inputShape: this.strToArray(this._inputShape),
                outputShape: this.strToArray(this._outputShape)
            }
        };
        dict.params = this.addAttributes(dict.params);
        return dict;
    }
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
