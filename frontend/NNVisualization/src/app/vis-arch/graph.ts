export interface Link {
    source: string;
    target: string;
}

export class Graph {
    private _nodes: number[];
    private _links: number[][];

    constructor() {
        this._nodes = [];
        this._links = [];
    }

    addNode(id: number): void {
        if (this._nodes.some(n => (n === id))) {
            return;
        }

        this._nodes.push(id);
        this._links[id] = [];
    }

    removeNode(id: number): void {
        if (!this._nodes.some(n => (n === id))) {
            return;
        }

        this._nodes = this._nodes.filter(n => (n !== id));
        this._links.splice(id, 1);
        this._links = this._links.map(
            arr => (arr.filter(n => (n !== id)))
        );
    }

    addLink(source: number,  target: number): void {
        if (!this._links[source].some(n => (n === target))) {
            this._links[source].push(target);
        }
    }

    removeLink(source: number, target: number): void {
        this._links[source] = this._links[source].filter(n => (n !== target));
    }

    get nodes(): number[] {
        return this._nodes;
    }

    get links(): Link[] {
        const a = this._links.map(
            (arr, id) => (arr.map(n => ({source: String(id), target: String(n)})))
        );
        return a.reduce((p, v) => (p.concat(v)), []);
    }
}
