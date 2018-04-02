import { FullyConnectedLayer } from './fully-connected';

describe('FullyConnectedLayer', () => {
    let layer: FullyConnectedLayer;

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
        layer = FullyConnectedLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'fc',
            params: {
                inputShape: '1',
                numOutputs: 32,
                activation: 'Relu'
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 32]
        )).toBe(true, 'output should be [-1, 32]');
        expect(testEqualArrays(
            layer.calculateOutputShape([[100, 28, 28, 1]]),
            [100, 32]
        )).toBe(true, 'output should be [100, 32]');
    });

    it('test validateInputShapes', () => {
        expect(layer.validateInputShapes([[-1, 28, 28, 1]]))
            .toBe(true, '[[-1, 28, 28, 1]] should be correct input');
        expect(layer.validateInputShapes([]))
            .toBe(false, '[] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 28, 1], [-1, 28, 1]]))
            .toBe(false, '[[-1, 28, 1], [-1, 28, 1]] should be incorrect input');
    });
});
