import { Activation, StrToActivation } from './layer';

describe('StrToActivation', () => {
    it('test', () => {
        expect(StrToActivation('None')).toEqual(Activation.None);
        expect(StrToActivation('Relu')).toEqual(Activation.Relu);
        expect(StrToActivation('Sigmoid')).toEqual(Activation.Sigmoid);
    });
});
