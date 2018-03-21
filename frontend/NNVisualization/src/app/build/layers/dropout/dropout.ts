import { Layer } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class DropoutLayer extends Layer {
    private _keepProb: number;

    constructor(id: number, label: string, input = '1',
                keepProb = 0.5) {
        super(id, label, 'dropout', input, input);
        this._keepProb = keepProb;
    }

    static fromDict(dict: ArchNode): DropoutLayer {
        return new DropoutLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
            dict.params.keepProb
        );
    }

    get keepProb(): number {
        return this._keepProb;
    }

    set keepProb(keepProb: number) {
        this._keepProb = keepProb;
    }

    addAttributes(dict) {
        dict['keepProb'] = this._keepProb;
        return dict;
    }
}
