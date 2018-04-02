export class Score {
    public class_number: number;
    public class_name: string;
    public score: number;

    constructor(class_number: number, class_name: string, score: number) {
        this.class_number = class_number;
        this.class_name = class_name;
        this.score = score;
    }

}
