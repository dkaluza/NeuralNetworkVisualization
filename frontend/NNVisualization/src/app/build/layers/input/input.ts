import { Layer } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class InputLayer extends Layer {
    private _inputId: number;

    constructor(id: number, label: string,
        input = '-1, 28, 28, 1', output = '-1, 28, 28, 1',
        inputId = 1) {
        super(id, label, 'input', input, output);
        this._inputId = inputId;
    }

    get inputId(): number {
        return this._inputId;
    }

    set inputId(inputId: number ) {
        this._inputId = inputId;
    }

    static fromDict(dict: ArchNode): InputLayer {
        return new InputLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
            String(dict.params.outputShape),
            Number(dict.params.inputId)
        );
    }

    addAttributes(dict) {
        dict['inputId'] = this._inputId;
        return dict;
    }

    getMinNumOfInputs(): number {
        return 0;
    }

    getMaxNumOfInputs(): number {
        return 0;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        return this.strToArray(this.outputShape);
    }

    validateInputShapes(shapes: number[][]): boolean {
        return shapes.length === 0;
    }
}
