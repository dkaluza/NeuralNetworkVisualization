import { Layer, Activation } from '../layer/layer';

export class InputLayer extends Layer {

    constructor(id: number, label: string,
                input = [1], output: number[] = [1]) {
        super(id, label, 'input', input, output);
    }

    addAttributes(dict) {
        return dict;
    }
}
