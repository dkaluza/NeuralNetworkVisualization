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
        if (!this._links.get(source).some(n => (n === target))) {
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
        const white = new Set(this._nodes);
        const gray = new Set;
        const black = new Set;
        const loopMap = new Map;

        const visit = n => {
            const links = this._links.get(n);
            for (let i = 0; i < links.length; i += 1) {
                const v = links[i];
                if (white.has(v)) {
                    white.delete(v);
                    gray.add(v);
                    loopMap.set(v, n);
                    const ret = visit(v);
                    if (ret !== undefined) {
                        return ret;
                    }
                } else if (gray.has(v)) {
                    loopMap.set(v, n);
                    return v;
                }
            }
            gray.delete(n);
            black.add(n);
            return undefined;
        };

        while (white.size > 0) {
            let n = white.values().next().value;
            white.delete(n);
            gray.add(n);
            loopMap.set(n, undefined);
            const ret = visit(n);
            if (ret !== undefined) {
                const loop = [ret];
                n = loopMap.get(ret);
                while (n !== ret) {
                    loop.push(n);
                    n = loopMap.get(n);
                }
                return loop;
            }
        }
        return [];
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
