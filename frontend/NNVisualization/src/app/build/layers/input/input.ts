import { Layer } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class InputLayer extends Layer {
    private _inputId: number;
    private _shape: string;

    constructor(id: number, label: string,
                shape = '-1, 28, 28, 1', inputId = 1) {
        super(id, label, 'input');
        this._inputId = inputId;
        this._shape = shape;
    }

    get inputId(): number {
        return this._inputId;
    }

    set inputId(inputId: number ) {
        this._inputId = inputId;
    }

    get shape(): string {
        return this._shape;
    }

    set shape(shape: string) {
        this._shape = shape;
    }

    static fromDict(dict: ArchNode): InputLayer {
        return new InputLayer(
            Number(dict.id), dict.label,
            String(dict.params.shape),
            Number(dict.params.inputId)
        );
    }

    addAttributes(dict) {
        dict['inputId'] = this._inputId;
        dict['shape'] = this.strToArray(this._shape);
        return dict;
    }

    getMinNumOfInputs(): number {
        return 0;
    }

    getMaxNumOfInputs(): number {
        return 0;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        return this.strToArray(this._shape);
    }

    validateInputShapes(shapes: number[][]): boolean {
        return shapes.length === 0;
    }
}
