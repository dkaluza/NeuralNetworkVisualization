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

    doesLinkExist(source: number, target: number): boolean {
        if (!this._links.has(source)) {
            return false;
        }
        return !this._links.get(source).every(n => n !== target);
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
        /*
         * notVisited - nodes that weren't yet visited
         * beingVisited - nodes that we started visiting,
         *    but some children are still not done
         * visited - nodes that were visited and all its
         *    children were visited
         */
        const notVisited = new Set(this._nodes);
        const beingVisited = new Set;
        const visited = new Set;
        /*
         * map for reconstructing loop
         * every node remebers from which node
         *      it was visited
         */
        const loopMap = new Map;

        /*
         * function that recursively visit nodes
         *
         * it checks all children (v) of a node (n)
         * if v is in notVisited set:
         *      v is moved to beingVisited
         *      parent v is set to n
         *      recursively visit v
         * if v is in beingVisited it means that
         *      we found a loop
         * undefined means that no loop was found
         * number u as result means that there is a loop,
         *      and node u is in a loop
         */
        const visit = n => {
            const links = this._links.get(n);
            for (const v of links) {
                if (notVisited.has(v)) {
                    notVisited.delete(v);
                    beingVisited.add(v);
                    loopMap.set(v, n);
                    const ret = visit(v);
                    if (ret !== undefined) {
                        return ret;
                    }
                } else if (beingVisited.has(v)) {
                    loopMap.set(v, n);
                    return v;
                }
            }
            beingVisited.delete(n);
            visited.add(n);
            return undefined;
        };

        while (notVisited.size > 0) {
            let n = notVisited.values().next().value;
            notVisited.delete(n);
            beingVisited.add(n);
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
