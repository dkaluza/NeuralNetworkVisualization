// TODO: Implement

export class Model {
    private _id: number;
    private _name: string;
    private _description: string;

    constructor(id: number, name: string, desc: string) {
        this._id = id;
        this._name = name;
        this._description = desc;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }
}
