export interface Link {
    source: string;
    target: string;
}

export class Graph {
    private _nodes: number[];
    private _links: Map<number, number[]>;

    constructor() {
        this._nodes = [];
        this._links = new Map;
    }

    addNode(id: number): void {
        if (this._nodes.some(n => (n === id))) {
            return;
        }

        this._nodes.push(id);
        this._links.set(id, []);
    }

    removeNode(id: number): void {
        if (!this._nodes.some(n => (n === id))) {
            return;
        }

        this._nodes = this._nodes.filter(n => (n !== id));
        this._links.delete(id);
        this._links.forEach(
            (arr, key) => {
                this._links.set(key, arr.filter(n => (n !== id)));
            }
        );
    }

    addLink(source: number,  target: number): void {
        if (!this._links.get(source).some(n => (n === target)) &&
            source !== target) {
            this._links.get(source).push(target);
        }
    }

    removeLink(source: number, target: number): void {
        this._links.set(source, this._links.get(source).filter(n => (n !== target)));
    }

    get nodes(): number[] {
        return this._nodes;
    }

    get links(): Link[] {
        const a = [];
        this._links.forEach(
            (arr, id) => {
                a.push(arr.map(n => ({source: String(id), target: String(n)})));
            }
        );
        return a.reduce((p, v) => (p.concat(v)), []);
    }

    getGraphInputs(): number[] {
        const hasInputs = new Map();
        this._nodes.forEach(n => { hasInputs.set(n, false); });
        this._links.forEach(
            l => { l.forEach(n => { hasInputs.set(n, true); }); }
        );
        return this._nodes.filter(n => !hasInputs.get(n));
    }

    getGraphOutputs(): number[] {
        return this._nodes.filter(
            n => this._links.get(n).length === 0
        );
    }

    getNodeInputs(id: number): number[] {
        const inputs = [];
        this._links.forEach(
            (l, n) => {
                if (l.indexOf(id) > -1) {
                    inputs.push(n);
                }
            }
        );
        return inputs;
    }

    checkForLoop(): number[] {
        // this tries to do topological sort
        // if it can't that means that there exists a loop
        const edgeCounter = new Map();
        this._nodes.forEach(n => { edgeCounter.set(n, 0); });
        this._links.forEach(l => {
            l.forEach(n => {
                edgeCounter.set(n, edgeCounter.get(n) + 1);
            });
        });
        const queue = this.getGraphInputs();
        while (queue.length > 0) {
            const n = queue.shift();
            this._links.get(n).forEach(m => {
                edgeCounter.set(m, edgeCounter.get(m) - 1);
                if (edgeCounter.get(m) === 0) {
                    queue.push(m);
                }
            });
        }
        const loop = [];
        edgeCounter.forEach((l, n) => {
            if (l > 0) {
                loop.push(n);
            }
        });
        return loop;
    }

    sortTopologically(): number[] {
        // assumes that graph is DAG
        const sorted = [];

        const edgeCounter = new Map();
        this._nodes.forEach(n => { edgeCounter.set(n, 0); });
        this._links.forEach(l => {
            l.forEach(n => {
                edgeCounter.set(n, edgeCounter.get(n) + 1);
            });
        });
        const queue = this.getGraphInputs();
        while (queue.length > 0) {
            const n = queue.shift();
            sorted.push(n);
            this._links.get(n).forEach(m => {
                edgeCounter.set(m, edgeCounter.get(m) - 1);
                if (edgeCounter.get(m) === 0) {
                    queue.push(m);
                }
            });
        }

        return sorted;
    }
}
