import { DropoutLayer } from './dropout';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('DropoutLayer', () => {
    let layer: DropoutLayer;

    beforeEach(() => {
        layer = DropoutLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'dropout',
            params: {
                keepProb: 0.5
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
            {input: [[-1, 28, 28, 1]], output: true}
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
