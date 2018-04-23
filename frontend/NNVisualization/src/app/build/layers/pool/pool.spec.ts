import { PoolLayer, Pool, StrToPool } from './pool';
import { Padding, StrToPadding } from '../conv/conv';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('StrToPool', () => {
    it('test', () => {
        expect(StrToPool('Max')).toEqual(Pool.Max);
        expect(StrToPool('Avarage')).toEqual(Pool.Avarage);
    });
});

describe('PoolLayer', () => {
    let layer: PoolLayer;

    beforeEach(() => {
        layer = PoolLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'pool',
            params: {
                kernelShape: '2, 2',
                strides: '2, 2',
                padding: 'Same',
                pool: 'Max'
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        let tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 14, 14, 1]},
            {input: [[-1, 28, 28, 16]], output: [-1, 14, 14, 16]},
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '2, 4';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 14, 7, 1]},
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '3, 5';
        tests = [
            {input: [[-1, 28, 28, 32]], output: [-1, 10, 6, 32]},
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.padding = Padding.Valid;
        layer.strides = '2, 2';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 14, 14, 1]},
            {input: [[-1, 28, 28, 16]], output: [-1, 14, 14, 16]},
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '2, 4';
        tests = [
            {input: [[-1, 28, 28, 32]], output: [-1, 14, 7, 32]},
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '3, 5';
        tests = [
            {input: [[-1, 28, 28, 32]], output: [-1, 9, 5, 32]},
        ];
        testsForCalculateOutputShape(layer, tests);
    });

    it('test validateInputShapes', () => {
        const tests = [
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [], output: false},
            {input: [[-1, 28, 28, 1], [-1, 28, 28, 1]], output: false},
            {input: [[-1, 100, 1]], output: false},
            {input: [[-1, 32, 32, 32, 1]], output: false},
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
