import { Layer } from './layer/layer';

export function testEqualArrays(a1, a2) {
    if (a1.length !== a2.length) {
        return false;
    }
    for (let i = 0; i < a1.length; i += 1) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}

export function arrayToString(arr) {
    return '[' + arr + ']';
}

export interface TestCase {
    input: any;
    output: any;
}

export function testsForCalculateOutputShape(layer: Layer, tests: TestCase[]) {
    for (const testCase of tests) {
        const result = layer.calculateOutputShape(testCase.input);
        expect(testEqualArrays(result, testCase.output))
            .toBe(true, testCase.input + ' should give ' + testCase.output + ', not ' + result);
    }
}

export function testsForValidateInputShapes(layer: Layer, tests: TestCase[]) {
    for (const testCase of tests) {
        const result = layer.validateInputShapes(testCase.input);
        expect(result).toBe(
            testCase.output,
            testCase.input + ' should give ' + testCase.output + ', not ' + result);
    }
}
