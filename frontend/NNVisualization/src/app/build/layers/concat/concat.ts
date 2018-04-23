import { Layer } from '../layer/layer';

import { ArchNode } from '../../../selected-architecture/architecture';

export class ConcatLayer extends Layer {
    private _axis: number;

    constructor(id: number, label: string,
                axis = 1) {
        super(id, label, 'concat');
        this._axis = axis;
    }

    get axis(): number {
        return this._axis;
    }

    set axis(axis: number) {
        this._axis = axis;
    }

    static fromDict(dict: ArchNode): ConcatLayer {
        return new ConcatLayer(
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
        return undefined;
    }

    validateInputShapes(shapes: number[][]): boolean {
        for (let i = 1; i < shapes.length; i += 1) {
            if (shapes[0].length !== shapes[i].length ||
                shapes[0].some((v, j) => v !== shapes[i][j] && j !== this._axis)) {
                return false;
            }
        }
        if (this._axis < 0 || this._axis >= shapes[0].length) {
            return false;
        }
        return true;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        const shape = [];
        for (let i = 0; i < shapes[0].length; i += 1) {
            if (i !== this._axis) {
                shape.push(shapes[0][i]);
            } else {
                let sum = 0;
                shapes.forEach(arr => { sum += arr[this._axis]; });
                shape.push(sum);
            }
        }
        return shape;
    }
}
