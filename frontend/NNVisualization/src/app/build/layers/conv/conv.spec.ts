import { ConvLayer, Padding, StrToPadding } from './conv';
import { testsForCalculateOutputShape, testsForValidateInputShapes } from '../test-utils';

describe('StrToPadding', () => {
    it('test', () => {
        expect(StrToPadding('Same')).toBe(Padding.Same);
        expect(StrToPadding('Valid')).toBe(Padding.Valid);
    });
});

describe('ConvLayer', () => {
    let layer: ConvLayer;

    beforeEach(() => {
        layer = ConvLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'conv',
            params: {
                numFilters: 32,
                kernelShape: '3, 3',
                strides: '1, 1',
                padding: 'Same',
                activation: 'Relu'
            }
        });
    });

    afterEach(() => {
        layer = undefined;
    });

    it('test calculateOutputShape', () => {
        let tests = [
            {input: [[-1, 28, 28, 1]] , output: [-1, 28, 28, 32]},
            {input: [[-1, 28, 28, 16]], output: [-1, 28, 28, 32]}
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '2, 4';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 14, 7, 32]}
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '3, 5';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 10, 6, 32]}
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.padding = Padding.Valid;
        layer.strides = '1, 1';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 28, 28, 32]},
            {input: [[-1, 28, 28, 16]], output: [-1, 28, 28, 32]}
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '2, 4';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 14, 7, 32]}
        ];
        testsForCalculateOutputShape(layer, tests);

        layer.strides = '3, 5';
        tests = [
            {input: [[-1, 28, 28, 1]], output: [-1, 9, 5, 32]}
        ];
    });

    it('test validateInputShapes', () => {
        let tests = [
            {input: [], output: false},
            {input: [[-1, 28, 28, 1]], output: true},
            {input: [[-1, 28, 28, 1], [-1, 28, 28, 1]], output: false},
            {input: [], output: false},
            {input: [[-1, 32, 32], [-1, 32, 32]], output: false},
            {input: [[32, 32]], output: false},
            {input: [[32, 32, 32]], output: false},
            {input: [[32, 32, 32, 32, 32]], output: false},
            {input: [[32, 32, 32, 32, 32, 32]], output: false}
        ];
        testsForValidateInputShapes(layer, tests);

        layer.kernelShape = '3';
        layer.strides = '1';
        tests = [
            {input: [[32, 32]], output: false},
            {input: [[32, 32, 32]], output: true},
            {input: [[32, 32, 32, 23]], output: false},
            {input: [[32, 32, 32, 32, 32]], output: false},
            {input: [[32, 32, 32, 32, 32, 32]], output: false}
        ];
        testsForValidateInputShapes(layer, tests);

        layer.kernelShape = '3, 3, 3';
        layer.strides = '1, 1, 1';
        tests = [
            {input: [[32, 32]], output: false},
            {input: [[32, 32, 32]], output: false},
            {input: [[32, 32, 32, 23]], output: false},
            {input: [[32, 32, 32, 32, 32]], output: true},
            {input: [[32, 32, 32, 32, 32, 32]], output: false}
        ];
        testsForValidateInputShapes(layer, tests);
    });
});
