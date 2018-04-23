import { Graph, Link } from './graph';

describe('Graph', () => {
    let graph: Graph;

    // tests if two arrays have the same elements
    const testEqualArrays = (arr1, arr2) => {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };

    const testEqualLinks = (l1, l2) => {
        return l1.source === l2.source &&
               l1.target === l2.target;
    };

    const testEqualLinkArrays = (arr1, arr2) => {
        if (arr1.length !== arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i += 1) {
            if (!arr2.some(l => testEqualLinks(l, arr1[i]))) {
                return false;
            }
        }
        return true;
    };

    const addMultipleNodes = nodes => {
        nodes.forEach(n => { graph.addNode(n); });
    };

    const addMulitpleLinks = links => {
        links.forEach(l => { graph.addLink(l[0], l[1]); });
    };

    beforeEach(() => {
        graph = new Graph();
    });

    afterEach(() => {
        graph = undefined;
    });

    it('test if empty at the beginning', () => {
        expect(graph.nodes.length === 0).toBeTruthy();
        expect(graph.links.length === 0).toBeTruthy();
    });

    it('test addNode', () => {
        let nodes: number[];

        graph.addNode(1);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes, [1])).toBeTruthy();

        graph.addNode(3);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(), [1, 3])).toBeTruthy();
    });

    it('test addNode - same node mulitple times', () => {
        let nodes: number[];

        addMultipleNodes([1, 2, 3]);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(), [1, 2, 3])).toBeTruthy();

        graph.addNode(2);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(), [1, 2, 3])).toBeTruthy();

        addMultipleNodes([1, 2, 3, 4]);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(), [1, 2, 3, 4]))
              .toBeTruthy();
    });

    it('test addLink', () => {
        let links: Link[];
        let expectedLinks: Link[];

        addMultipleNodes([1, 2, 3]);
        graph.addLink(1, 2);
        links = graph.links;
        expectedLinks = [{source: '1', target: '2'}];
        expect(testEqualLinkArrays(links, expectedLinks))
              .toBeTruthy();

        graph.addLink(3, 1);
        links = graph.links;
        expectedLinks = [
            {source: '1', target: '2'},
            {source: '3', target: '1'}
        ];
        expect(testEqualLinkArrays(links, expectedLinks))
              .toBeTruthy();
    });

    it('test addLink - same link multiple times', () => {
        let links: Link[];
        let expectedLinks: Link[];

        addMultipleNodes([1, 2, 3]);
        graph.addLink(1, 2);
        graph.addLink(3, 1);
        links = graph.links;
        expectedLinks = [
            {source: '1', target: '2'},
            {source: '3', target: '1'}
        ];
        expect(testEqualLinkArrays(links, expectedLinks))
              .toBeTruthy();

        graph.addLink(1, 2);
        links = graph.links;
        expect(testEqualLinkArrays(links, expectedLinks))
            .toBeTruthy();
    });

    it('test addLink - source === target', () => {
        let links: Link[];
        let expectedLinks: Link[];

        addMultipleNodes([1, 2]);
        graph.addLink(1, 2);
        links = graph.links;
        expectedLinks = [{source: '1', target: '2'}];
        expect(testEqualLinkArrays(links, expectedLinks))
            .toBeTruthy();

        graph.addLink(2, 2);
        links = graph.links;
        expect(testEqualLinkArrays(links, expectedLinks))
            .toBeTruthy();
    });

    it('test removeNode', () => {
        let nodes: number[];

        addMultipleNodes([1, 2, 3, 4, 5]);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(),
                    [1, 2, 3, 4, 5])).toBeTruthy();

        graph.removeNode(2);
        graph.removeNode(5);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(),
                    [1, 3, 4])).toBeTruthy();
    });

    it('test removeNode - remove not existing node', () => {
        let nodes: number[];

        addMultipleNodes([1, 2, 3]);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(),
                    [1, 2, 3])).toBeTruthy();

        graph.removeNode(4);
        nodes = graph.nodes;
        expect(testEqualArrays(nodes.sort(),
                    [1, 2, 3])).toBeTruthy();
    });

    it('test removeLink', () => {
        let expectedLinks: Link[];

        addMultipleNodes([1, 2, 3]);
        addMulitpleLinks([[1, 2], [2, 3]]);
        graph.removeLink(1, 2);
        expectedLinks = [{source: '2', target: '3'}];
        expect(testEqualLinkArrays(graph.links,
                expectedLinks)).toBeTruthy();
    });

    it('test removeLink - remove not existing link', () => {
        let expectedLinks: Link[];

        addMultipleNodes([1, 2, 3]);
        addMulitpleLinks([[1, 2], [2, 3]]);
        graph.removeLink(2, 1);
        expectedLinks = [
            {source: '1', target: '2'},
            {source: '2', target: '3'}
        ];
        expect(testEqualLinkArrays(graph.links,
                expectedLinks)).toBeTruthy();
    });

    it('test removeNode - check links after deleting node', () => {
        addMultipleNodes([1, 2, 3]);
        addMulitpleLinks([[1, 2], [2, 3]]);

        graph.removeNode(2);
        expect(testEqualLinkArrays(graph.links, [])).toBeTruthy();
    });

    it('test getGraphInputs', () => {
        let nodes: number[];

        nodes = graph.getGraphInputs();
        expect(testEqualArrays(nodes, [])).toBeTruthy();

        addMultipleNodes([1, 2]);
        graph.addLink(1, 2);
        nodes = graph.getGraphInputs();
        expect(testEqualArrays(nodes, [1])).toBeTruthy();

        addMultipleNodes([3, 4, 5]);
        addMulitpleLinks([[3, 4], [4, 5], [2, 4], [2, 5]]);
        nodes = graph.getGraphInputs();
        expect(testEqualArrays(nodes.sort(), [1, 3]))
              .toBeTruthy();
    });

    it('test getGraphOutputs', () => {
        let nodes: number[];

        nodes = graph.getGraphOutputs();
        expect(testEqualArrays(nodes, [])).toBeTruthy();

        addMultipleNodes([1, 2]);
        graph.addLink(1, 2);
        nodes = graph.getGraphOutputs();
        expect(testEqualArrays(nodes, [2])).toBeTruthy();

        addMultipleNodes([3, 4, 5]);
        addMulitpleLinks([[3, 4], [4, 5], [2, 4], [2, 5]]);
        nodes = graph.getGraphOutputs();
        expect(testEqualArrays(nodes.sort(), [5]))
              .toBeTruthy();
    });

    it('test getNodeInputs', () => {
        addMultipleNodes([1, 2]);
        graph.addLink(1, 2);
        expect(testEqualArrays(
                graph.getNodeInputs(1),
                [])).toBeTruthy();
        expect(testEqualArrays(
                graph.getNodeInputs(2),
                [1])).toBeTruthy();

        addMultipleNodes([3, 4, 5]);
        addMulitpleLinks([[3, 4], [4, 5], [2, 4], [2, 5]]);
        expect(testEqualArrays(
                graph.getNodeInputs(4).sort(),
                [2, 3])).toBeTruthy();
        expect(testEqualArrays(
                graph.getNodeInputs(5).sort(),
                [2, 4])).toBeTruthy();
    });

    it('test sortTopologically', () => {
        let nodes: number[];

        addMultipleNodes([1, 2, 3, 4]);
        addMulitpleLinks([[1, 2], [2, 3], [3, 4]]);
        expect(testEqualArrays(graph.sortTopologically(),
                               [1, 2, 3, 4])).toBeTruthy();

        graph = new Graph();
        addMultipleNodes([1, 2, 3, 4, 5]);
        addMulitpleLinks([[1, 2], [3, 4], [2, 5], [4, 5]]);
        nodes = graph.sortTopologically();
        expect(nodes.indexOf(1)).toBeLessThan(nodes.indexOf(2));
        expect(nodes.indexOf(1)).toBeLessThan(nodes.indexOf(5));
        expect(nodes.indexOf(3)).toBeLessThan(nodes.indexOf(4));
        expect(nodes.indexOf(3)).toBeLessThan(nodes.indexOf(5));
        expect(nodes.indexOf(2)).toBeLessThan(nodes.indexOf(5));
        expect(nodes.indexOf(4)).toBeLessThan(nodes.indexOf(5));
    });
});
