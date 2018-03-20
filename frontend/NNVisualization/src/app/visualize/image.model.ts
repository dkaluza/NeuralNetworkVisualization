export class Image {
    public datasetId: number;
    public imageId: number;
    public imageName: string;
    public imagePath: string;
    public label: number;

    constructor(imageId: number, datasetId: number, imageName: string, imagePath: string, label: number) {
        this.imageId = imageId;
        this.datasetId = datasetId;
        this.imageName = imageName;
        this.imagePath = imagePath;
        this.label = label;
    }
}
