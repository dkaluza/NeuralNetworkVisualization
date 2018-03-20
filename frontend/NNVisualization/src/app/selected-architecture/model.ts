// TODO: Implement

export class Model {
    private _id: number;
    private _name: string;
    private _description: string;
    private _loss: string;
    private _optimizer: string;
    private _optimizer_params: any;
    private _batch_size: number;
    private _nepochs: number;
    private _training_loss: number;
    private _validation_loss: number;

    constructor(id: number, name: string, desc: string,
                loss: string, optimizer: string, params: any,
                batch_size: number, nepochs: number,
                training_loss: number, validation_loss: number) {
        this._id = id;
        this._name = name;
        this._description = desc;
        this._loss = loss;
        this._optimizer = optimizer;
        this._optimizer_params = params;
        this._batch_size = batch_size;
        this._nepochs = nepochs;
        this._training_loss = training_loss;
        this._validation_loss = validation_loss;
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

    get loss(): string {
        return this._loss;
    }

    get optimizer(): string {
        return this._optimizer;
    }

    get optimizer_params(): any {
        return this._optimizer_params;
    }

    get batch_size(): number {
        return this._batch_size;
    }

    get nepochs(): number {
        return this._nepochs;
    }

    get training_loss(): number {
        return this._training_loss;
    }

    get validation_loss(): number {
        return this._validation_loss;
    }
}
