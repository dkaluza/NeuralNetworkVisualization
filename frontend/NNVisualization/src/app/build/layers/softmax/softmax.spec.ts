import { SoftmaxLayer } from './softmax';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('SoftmaxLayer', () => {
    let layer: SoftmaxLayer;

    beforeEach(() => {
        layer = SoftmaxLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'softmax',
            params: {
                axis: -1
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 28, 28, 1]},
        ];
        testsForCalculateOutputShape(layer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [], output: false},
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [[-1, 28, 28, 1], [-1, 28, 28, 1]], output: false},
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
