import { InputLayer } from './input';

describe('InputLayer', () => {
    let input: InputLayer;

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
        input = InputLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'input',
            params: {
                inputShape: '-1, 28, 28, 1',
                outputShape: '-1, 28, 28, 1',
                inputId: 1
            }
        });
    });

    afterEach(() => {
        input = undefined;
    });

    it('test calculateOutputShape', () => {
        expect(testEqualArrays(
            input.calculateOutputShape([]),
            [-1, 28, 28, 1]))
            .toBe(true, 'output shape should be [-1, 28, 28, 1]');
    });

    it('test validateInputShapes', () => {
        expect(input.validateInputShapes([]))
            .toBe(true, '[] should be correct input');
        expect(input.validateInputShapes([[-1, 28, 28, 1]]))
            .toBe(false, '[[-1, 28, 28, 1] should be incorrect input');
    });
});
