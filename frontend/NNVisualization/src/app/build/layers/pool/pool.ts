import { Layer } from '../layer/layer';
import { Padding, StrToPadding } from '../conv/conv';

export enum Pool {
    Max,
    Avarage
}

export function StrToPool(str: string): Pool {
    switch (str) {
        case 'Max':
            return Pool.Max;
        case 'Avarage':
            return Pool.Avarage;
        default:
            return Pool.Max;
    }
}

export class PoolLayer extends Layer {
    private _kernelShape: string;
    private _strides: string;
    private _padding: Padding;
    private _pool: Pool;

    constructor(id: number, label: string, input = '1',
                kernelShape = '2, 2', strides = '2, 2',
                padding = Padding.Valid, pool = Pool.Max) {
        super(id, label, 'pool', input, input);

        this._kernelShape = kernelShape;
        this._strides = strides;
        this._padding = padding;
        this._pool = pool;
    }

    static fromDict(dict): PoolLayer {
        return new PoolLayer(
            dict.id, dict.label,
            String(dict.params.inputShape),
            String(dict.params.kernelShape),
            String(dict.params.strides),
            StrToPadding(dict.params.padding),
            StrToPool(dict.params.pool)
        );
    }

    get kernelShape(): string {
        return this._kernelShape;
    }

    set kernelShape(kernelShape: string) {
        this._kernelShape = kernelShape;
    }

    get strides(): string {
        return this._strides;
    }

    set strides(strides: string) {
        this._strides = strides;
    }

    get padding(): Padding {
        return this._padding;
    }

    set padding(padding: Padding) {
        this._padding = padding;
    }

    get pool(): Pool {
        return this._pool;
    }

    set pool(pool: Pool) {
        this._pool = pool;
    }

    addAttributes(dict) {
        dict['kernelShape'] = this.strToArray(this._kernelShape);
        dict['strides'] = this.strToArray(this._strides);
        dict['padding'] = Padding[this._padding];
        dict['pool'] = Pool[this._pool];
        return dict;
    }

    getMinNumOfInputs(): number {
        return 1;
    }

    getMaxNumOfInputs(): number {
        return 1;
    }

    calculateOutputShape(shapes: number[][]): number[] {
        const shape = shapes[0];
        let x = 0, y = 0;
        const s = this.strToArray(this._strides);
        if (this._padding === Padding.Same) {
            x = Math.ceil(shape[1] / s[0]);
            y = Math.ceil(shape[2] / s[1]);
        } else { // this._padding === Padding.Valid
            x = Math.ceil((shape[1] - s[0] + 1) / s[0]);
            y = Math.ceil((shape[2] - s[1] + 1) / s[1]);
        }

        return [shape[0], x, y, shape[3]];
    }

    validateInputShapes(shapes: number[][]): boolean {
        if (shapes.length !== 1) {
            return false;
        }
        if (shapes[0].length !== 4) {
            return false;
        }
        return true;
    }
}
