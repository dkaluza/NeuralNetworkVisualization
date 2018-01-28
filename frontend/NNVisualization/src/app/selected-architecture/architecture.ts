import { Layer } from './layer'

export interface ArchNode {
    id: string;
    label: string;
}

export interface ArchLink {
    source: string;
    target: string;
}

export class Architecture {
    private _id: number;
    private _name: string;
    private _desc: string;
    private _layers: Layer[];

    private _nodes: ArchNode[];
    private _links: ArchLink[];

    constructor(id: number, name: string, nodes: ArchNode[], links: ArchLink[]) {
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
    // yeah

    get description(): string {
        return this._desc
    }
}
