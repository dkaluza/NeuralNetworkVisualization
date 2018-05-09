export class Image {
    public datasetId: number;
    public imageId: number;
    public imageName: string;
    public imagePath: string;
    public label: number;
    public display_path: string;
    public trainsample_position: number;
    public trainsample_id: number;

    constructor(imageId: number, datasetId: number, imageName: string,
                imagePath: string, label: number,
                trainsample_position: number, trainsample_id: number) {
        this.imageId = imageId;
        this.datasetId = datasetId;
        this.imageName = imageName;
        this.imagePath = imagePath;
        this.label = label;
        this.display_path = '';
        this.trainsample_position = trainsample_position;
        this.trainsample_id = trainsample_id;
    }
}
