import { ConvLayer, Padding, StrToPadding } from './conv';

describe('StrToPadding', () => {
    it('test', () => {
        expect(StrToPadding('Same')).toBe(Padding.Same);
        expect(StrToPadding('Valid')).toBe(Padding.Valid);
    });
});

describe('ConvLayer', () => {
    let layer: ConvLayer;

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
        layer = ConvLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'conv',
            params: {
                inputShape: '1',
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
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 28, 28, 32]
        )).toBe(true, 'output should be [-1, 28, 28, 32]');
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 16]]),
            [-1, 28, 28, 32]
        )).toBe(true, 'output should be [-1, 28, 28, 32]');

        layer.strides = '2, 4';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 14, 7, 32]
        )).toBe(true, 'output should be [-1, 14, 7, 32]');

        layer.strides = '3, 5';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 10, 6, 32]
        )).toBe(true, 'output should be [-1, 10, 6, 32]');

        layer.padding = Padding.Valid;
        layer.strides = '1, 1';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 28, 28, 32]
        )).toBe(true, 'output should be [-1, 28, 28, 32]');
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 16]]),
            [-1, 28, 28, 32]
        )).toBe(true, 'output should be [-1, 28, 28, 32]');

        layer.strides = '2, 4';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 14, 7, 32]
        )).toBe(true, 'output should be [-1, 14, 7, 32]');

        layer.strides = '3, 5';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 9, 5, 32]
        )).toBe(true, 'output should be [-1, 9, 5, 32]');
    });

    it('test validateInputShapes', () => {
        expect(layer.validateInputShapes([]))
            .toBe(false, '[] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 28, 28, 1]]))
            .toBe(true, '[[-1, 28, 28, 1]] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 28, 28, 1], [-1, 28, 28, 1]]))
            .toBe(false, '[[-1, 28, 28, 1], [-1, 28, 28, 1]] should be incorrect input');

        expect(layer.validateInputShapes([]))
            .toBe(false, '[] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 32, 32], [-1, 32, 32]]))
            .toBe(false, '[[-1, 32, 32], [-1, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32]]))
            .toBe(false, '[[32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32]]))
            .toBe(false, '[[32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32]]))
            .toBe(false, '[[32, 32, 32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32, 32]]))
            .toBe(false, '[[32, 32, 32, 32, 32, 32]] should be incorrect input');

        layer.kernelShape = '3';
        layer.strides = '1';
        expect(layer.validateInputShapes([[32, 32]]))
            .toBe(false, '[[32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32]]))
            .toBe(true, '[[32, 32, 32]] should be correct input');
        expect(layer.validateInputShapes([[32, 32, 32, 23]]))
            .toBe(false, '[[32, 32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32]]))
            .toBe(false, '[[32, 32, 32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32, 32]]))
            .toBe(false, '[[32, 32, 32, 32, 32, 32]] should be incorrect input');

        layer.kernelShape = '3, 3, 3';
        layer.strides = '1, 1, 1';
        expect(layer.validateInputShapes([[32, 32]]))
            .toBe(false, '[[32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32]]))
            .toBe(false, '[[32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 23]]))
            .toBe(false, '[[32, 32, 32, 32]] should be incorrect input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32]]))
            .toBe(true, '[[32, 32, 32, 32, 32]] should be correct input');
        expect(layer.validateInputShapes([[32, 32, 32, 32, 32, 32]]))
            .toBe(false, '[[32, 32, 32, 32, 32, 32]] should be incorrect input');
    });
});
