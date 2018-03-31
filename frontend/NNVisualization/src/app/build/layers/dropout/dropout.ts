import { Layer } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class DropoutLayer extends Layer {
    private _keepProb: number;

    constructor(id: number, label: string, input = '1',
                keepProb = 0.5) {
        super(id, label, 'dropout', input, input);
        this._keepProb = keepProb;
    }

    static fromDict(dict: ArchNode): DropoutLayer {
        return new DropoutLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
            dict.params.keepProb
        );
    }

    get keepProb(): number {
        return this._keepProb;
    }

    set keepProb(keepProb: number) {
        this._keepProb = keepProb;
    }

    addAttributes(dict) {
        dict['keepProb'] = this._keepProb;
        return dict;
    }

    getMinNumOfInputs(): number {
        return 1;
    }

    getMaxNumOfInputs(): number {
        return 1;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        return shapes[0];
    }

    validateInputShapes(shapes: number[][]): boolean {
        return shapes.length === 1;
    }
}
