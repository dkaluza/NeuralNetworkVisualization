import { AddLayer } from './add';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('AddLayer', () => {
    let addLayer: AddLayer;

    beforeEach(() => {
        addLayer = AddLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'add',
            params: {}
        });
    });

    afterEach(() => {
        addLayer = undefined;
    });

    it('test calculateOutputShape', () => {
        const tests = [];

        const shape = [-1, 28, 28, 1];
        for (let i = 1; i <= 10; i += 1) {
            const inputShapes = new Array(i);
            inputShapes.fill(shape);
            tests.push({
                input: inputShapes,
                output: shape
            });
        }

        testsForCalculateOutputShape(addLayer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [], output: false},
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [[-1, 28], [-1, 28]], output: true},
            {input: [[-1, 28], [-1, 29]], output: false}
        ];
        testsForValidateInputShapes(addLayer, tests);
    });
});
