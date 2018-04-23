import { ConcatLayer } from './concat';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('ConcatLayer', () => {
    let concatLayer: ConcatLayer;

    beforeEach(() => {
        concatLayer = ConcatLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'concat',
            params: {
                axis: 2
            }
        });
    });

    afterEach(() => {
        concatLayer = undefined;
    });

    it('test calculateOutputShape', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 28, 28, 1]},
            {input: [[-1, 28, 28, 1], [-1, 28, 28, 1]], output: [-1, 28, 56, 1]},
            {input: [[-1, 28, 28, 1], [-1, 28, 2, 1]], output: [-1, 28, 30, 1]}
        ];
        testsForCalculateOutputShape(concatLayer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [], output: false},
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [[-1, 28, 28, 1], [-1, 28, 14, 1]], output: true},
            {input: [[-1, 28, 28, 1], [-1, 24, 28, 1]], output: false}
        ];
        testsForValidateInputShapes(concatLayer, tests);
    });
});
