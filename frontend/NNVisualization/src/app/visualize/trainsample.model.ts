export class Trainsample {
    public id: number;
    public datasetId: number;
    public name: string;
    public label: number;
    public path: string;

    constructor(id: number, datasetId: number, name: string, label: number) {
        this.id = id;
        this.datasetId = datasetId;
        this.name = name;
        this.label = label;
        this.path = '';
    }
}
