import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    host: {
        '[class]': '"block-component"'
    }
})
export class DetailsComponent implements OnInit {

    @Input()
    details: [string, string][];

    @Input()
    header: string;

    @Input()
    width = '60%';

    constructor() { }

    ngOnInit() { }

}
