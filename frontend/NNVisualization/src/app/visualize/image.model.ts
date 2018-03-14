export class Image {
    public imageId: number;
    public imageName: string;
    public imagePath: string;

    constructor(imageId: number, imageName: string, imagePath: string) {
        this.imageId = imageId;
        this.imageName = imageName;
        this.imagePath = imagePath;
    }
}
