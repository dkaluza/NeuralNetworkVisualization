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
}
