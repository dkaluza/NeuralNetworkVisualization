import { Layer } from './layer'

export class Architecture {
    private _id: number;
    private _name: string;
    private _layers: Layer[];

    private _nodes: any[];
    private _links: any[];

    constructor(id: number, name: string, nodes: any[], links: any[]) {
        this._id = id;
        this._name = name;
        // this._layers = layers; // maybe should be a deep copy?
        this._nodes = nodes;
        this._links = links;
    }

    get name(): string {
        return this._name;
    }

    get id(): number {
        return this._id;
    }

    get nodes() {
        return this._nodes;
    }

    get links() {
        return this._links;
    }

    // any more functions?
}
