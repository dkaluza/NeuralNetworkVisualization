import { InputLayer } from './input';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

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
        const tests = [
            {input: [], output: [-1, 28, 28, 1]},
        ];
        testsForCalculateOutputShape(input, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [], output: true},
            {input: [[-1, 28, 28, 1]], output: false},
        ];
        testsForValidateInputShapes(input, tests);
    });
});
