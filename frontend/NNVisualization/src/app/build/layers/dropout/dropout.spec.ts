import { DropoutLayer } from './dropout';

describe('DropoutLayer', () => {
    let layer: DropoutLayer;

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
        layer = DropoutLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'dropout',
            params: {
                inputShape: '1',
                keepProb: 0.5
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
    });
});
