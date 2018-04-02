import { BatchNormLayer } from './batch-norm';

describe('BatchNormLayer', () => {
    let layer: BatchNormLayer;

    const testEqualArrays = (a1, a2) => {
        if (a1.length !== a2.length) {
            return false;
        }
        for (let i = 0; i < a1.length; i += 1) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        return true;
    };

    beforeEach(() => {
        layer = BatchNormLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'dropout',
            params: {
                inputShape: '1',
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
