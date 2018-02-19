export class Layer {
    private _id: number;
    private _label: string;

    private _inputShape: number[];
    private _outputShape: number[];

    constructor(id: number, label: string,
                input: number[], output: number[]) {
        this._id = id;
        this._label = label;
        this._inputShape = input;
        this._outputShape = output;
    }

    ngOnInit() {
    }

    get id(): number {
        return this._id;
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
}

export enum Activation {
    None,
    Relu,
    Sigmoid,
}
