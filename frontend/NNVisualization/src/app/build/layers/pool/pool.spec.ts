import { PoolLayer, Pool, StrToPool } from './pool';
import { Padding, StrToPadding } from '../conv/conv';

describe('StrToPool', () => {
    it('test', () => {
        expect(StrToPool('Max')).toEqual(Pool.Max);
        expect(StrToPool('Avarage')).toEqual(Pool.Avarage);
    });
});

describe('PoolLayer', () => {
    let layer: PoolLayer;

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
        layer = PoolLayer.fromDict({
            id: '1', label: 'label',
            layerType: 'pool',
            params: {
                inputShape: '-1, 28, 28, 1',
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
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 14, 14, 1]
        )).toBe(true, 'output should be [-1, 28, 28, 32]');
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 16]]),
            [-1, 14, 14, 16]
        )).toBe(true, 'output should be [-1, 14, 14, 16]');

        layer.strides = '2, 4';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 14, 7, 1]
        )).toBe(true, 'output should be [-1, 14, 7, 1]');

        layer.strides = '3, 5';
        console.log(layer.calculateOutputShape([[-1, 28, 28, 32]]));
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 32]]),
            [-1, 10, 6, 32]
        )).toBe(true, 'output should be [-1, 10, 6, 32]');

        layer.padding = Padding.Valid;
        layer.strides = '2, 2';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 1]]),
            [-1, 14, 14, 1]
        )).toBe(true, 'output should be [-1, 14, 14, 1]');
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 16]]),
            [-1, 14, 14, 16]
        )).toBe(true, 'output should be [-1, 14, 14, 16]');

        layer.strides = '2, 4';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 32]]),
            [-1, 14, 7, 32]
        )).toBe(true, 'output should be [-1, 14, 7, 32]');

        layer.strides = '3, 5';
        expect(testEqualArrays(
            layer.calculateOutputShape([[-1, 28, 28, 32]]),
            [-1, 9, 5, 32]
        )).toBe(true, 'output should be [-1, 9, 5, 32]');
    });

    it('test validateInputShapes', () => {
        expect(layer.validateInputShapes([[-1, 28, 28, 1]]))
            .toBe(true, '[[-1, 28, 28, 1] should be correct input');
        expect(layer.validateInputShapes([]))
            .toBe(false, '[] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 28, 28, 1], [-1, 28, 28, 1]]))
            .toBe(false, '[[-1, 28, 28, 1], [-1, 28, 28, 1]] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 100, 1]]))
            .toBe(false, '[[-1, 100, 1]] should be incorrect input');
        expect(layer.validateInputShapes([[-1, 32, 32, 32, 1]]))
            .toBe(false, '[[-1, 32, 32, 32, 1]] should be incorrect input');
    });
});
