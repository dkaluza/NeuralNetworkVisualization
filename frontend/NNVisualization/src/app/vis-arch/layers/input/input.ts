import { Layer, Activation } from '../layer/layer';
import { ArchNode } from '../../../selected-architecture/architecture';

export class InputLayer extends Layer {

    constructor(id: number, label: string,
                input = '-1, 28, 28, 1', output = '-1, 28, 28, 1') {
        super(id, label, 'input', input, output);
    }

    static fromDict(dict: ArchNode): InputLayer {
        return new InputLayer(
            Number(dict.id), dict.label,
            String(dict.params.inputShape),
            String(dict.params.outputShape)
        );
    }

    addAttributes(dict) {
        return dict;
    }
}
