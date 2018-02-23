export abstract class Layer {
    private _id: number;
    private _label: string;
    private _layerType: string;

    private _inputShape: number[];
    private _outputShape: number[];

    constructor(id: number, label: string, layerType: string,
                input: number[], output: number[]) {
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

    get inputShape(): number[] {
        return this._inputShape;
    }

    set inputShape(input: number[]) {
        this._inputShape = input;
    }

    get outputShape(): number[] {
        return this._outputShape;
    }

    set outputShape(output: number[]) {
        this._outputShape = output;
    }

    abstract addAttributes(dict);

    toDict() {
        const dict = {
            id: String(this._id),
            label: this._label,
            layerType: this._layerType,
            params: {
                inputShape: this._inputShape,
                outputShape: this._outputShape
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
