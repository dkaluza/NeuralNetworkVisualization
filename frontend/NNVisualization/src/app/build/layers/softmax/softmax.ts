import { Layer } from '../layer/layer';

import { ArchNode } from '../../../selected-architecture/architecture';

export class SoftmaxLayer extends Layer {
    private _axis: number;

    constructor(id: number, label: string,
                axis = -1) {
        super(id, label, 'softmax');
        this._axis = axis;
    }

    get axis(): number {
        return this._axis;
    }

    set axis(axis: number) {
        this._axis = axis;
    }

    static fromDict(dict: ArchNode): SoftmaxLayer {
        return new SoftmaxLayer(
            Number(dict.id), dict.label,
            Number(dict.params.axis)
        );
    }

    addAttributes(dict) {
        dict['axis'] = this._axis;
        return dict;
    }

    getMinNumOfInputs(): number {
        return 1;
    }

    getMaxNumOfInputs(): number {
        return 1;
    }

    validateInputShapes(shapes: number[][]): boolean {
        return shapes.length === 1;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        return shapes[0];
    }
}
