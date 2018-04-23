export interface ArchNode {
    id: string;
    label: string;
    layerType: string;
    params: any;
}

export interface ArchLink {
    source: string;
    target: string;
}

export class Architecture {
    private _id: number;
    private _name: string;
    private _description: string;

    private _nodes: ArchNode[];
    private _links: ArchLink[];

    private _last_used: string;
    private _last_modified: string;

    constructor(id: number, name: string, desc: string,
                nodes: ArchNode[], links: ArchLink[],
                last_used: string, last_modified: string) {
        this._id = id;
        this._name = name;
        this._description = desc;
        // this._layers = layers; // maybe should be a deep copy?
        this._nodes = nodes;
        this._links = links;

        this._last_used = last_used;
        this._last_modified = last_modified;
    }

    get name(): string {
        return this._name;
    }

    get id(): number {
        return this._id;
    }

    get description(): string {
        return this._description;
    }

    get nodes() {
        return this._nodes;
    }

    get links() {
        return this._links;
    }

    get last_used(): string {
        return this._last_used;
    }

    get last_modified(): string {
        return this._last_modified;
    }

    // any more functions?
}
