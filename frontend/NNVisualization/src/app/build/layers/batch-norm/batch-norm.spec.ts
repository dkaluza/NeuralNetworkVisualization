import { BatchNormLayer } from './batch-norm';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('BatchNormLayer', () => {
    let layer: BatchNormLayer;

    beforeEach(() => {
        layer = BatchNormLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'dropout',
            params: {
                decay: 0.999,
                scale: true,
                center: false
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 28, 28, 1]}
        ];
        testsForCalculateOutputShape(layer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [[-1, 28, 28, 1], [-1, 28, 28, 1]], output: false},
            {input: [], output: false}
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
