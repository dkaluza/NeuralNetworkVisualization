import { BatchNormLayer } from './batch-norm';
import { testEqualArrays } from '../test-utils';

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
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 28, 28, 1]
        )).toBe(true, 'output should be [-1, 28, 28, 1]');
    });

    it('test validateInputShapes', () => {
        expect(layer.validateInputShapes([[-1, 28, 28, 1]]))
            .toBe(true, '[[-1, 28, 28, 1]] should be correct input');
        expect(layer.validateInputShapes([]))
            .toBe(false, '[] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 32, 32], [-1, 32, 32]]))
            .toBe(false, '[[-1, 32, 32], [-1, 32, 32]] should be incorrect input');
    });
});
