import { Layer } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class BatchNormLayer extends Layer {
    private _decay: number;
    private _center: boolean;
    private _scale: boolean;

    constructor(id: number, label: string, input = '1',
                decay = 0.999, center = true, scale = false) {
        super(id, label, 'batch_norm', input, input);
        this._decay = decay;
        this._center = center;
        this._scale = scale;
    }

    static fromDict(dict: ArchNode): BatchNormLayer {
        return new BatchNormLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
            dict.params.decay,
            dict.params.center,
            dict.params.scale
        );
    }

    get decay(): number {
        return this._decay;
    }

    set decay(decay: number) {
        this._decay = decay;
    }

    get center(): boolean {
        return this._center;
    }

    set center(center: boolean) {
        this._center = center;
    }

    get scale(): boolean {
        return this._scale;
    }

    set scale(scale: boolean) {
        this._scale = scale;
    }

    addAttributes(dict) {
        dict['decay'] = this._decay;
        dict['center'] = this._center;
        dict['scale'] = this._scale;
        return dict;
    }
}
