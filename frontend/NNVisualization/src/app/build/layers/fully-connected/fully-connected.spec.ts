import { FullyConnectedLayer } from './fully-connected';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('FullyConnectedLayer', () => {
    let layer: FullyConnectedLayer;

    beforeEach(() => {
        layer = FullyConnectedLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'fc',
            params: {
                numOutputs: 32,
                activation: 'Relu'
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 32]},
            {input: [[100, 28, 28, 1]], output: [100, 32]},
        ];
        testsForCalculateOutputShape(layer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [], output: false},
            {input: [[-1, 28, 1], [-1, 28, 1]], output: false},
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
