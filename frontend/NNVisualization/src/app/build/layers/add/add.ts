import { Layer } from '../layer/layer';

import { ArchNode } from '../../../selected-architecture/architecture';

export class AddLayer extends Layer {

    constructor(id: number, label: string) {
        super(id, label, 'add');
    }

    static fromDict(dict: ArchNode): AddLayer {
        return new AddLayer(
            Number(dict.id), dict.label
        );
    }

    addAttributes(dict) {
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
                shapes[0].some((v, j) => v !== shapes[i][j])) {
                return false;
            }
        }
        return true;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        return shapes[0];
    }
}
