import { InputLayer } from './input';
import { testEqualArrays } from '../test-utils';

describe('InputLayer', () => {
    let input: InputLayer;

    beforeEach(() => {
        input = InputLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'input',
            params: {
                shape: '-1, 28, 28, 1',
                outputShape: '-1, 28, 28, 1',
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
