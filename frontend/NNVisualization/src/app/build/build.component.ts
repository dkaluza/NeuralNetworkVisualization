import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service'
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'app-build',
    templateUrl: './build.component.html',
    styleUrls: ['./build.component.css']
})
export class BuildComponent implements OnInit {

    constructor(private selectedArchitectureService: SelectedArchitectureService,
                private restangular: Restangular) { }

    ngOnInit() {
    }

    saveCurrentArch() {
        if (this.selectedArchitectureService.architecture) {
            let currId = this.selectedArchitectureService.architecture.id
            let currName = this.selectedArchitectureService.architecture.name
            let currDesc = this.selectedArchitectureService.architecture.description
            this.saveArch(currName, currDesc, currId)
        } else
            alert('No architecture to save!')
    }

    saveAsNewArch(name: string) {
        let desc = prompt('Enter a short description:')

        if (desc != null)
            this.saveArch(name, desc, undefined)
    }

    private saveArch(name: string, description: string, id?: number) {
        // TODO: passing the selected arch somehow
        let postData = {
            'name': name,
            'description': description
        }

        if (id) postData['id'] = id

        this.restangular
            .one('add')
            .post(postData)
            .subscribe(
                () => { alert('Save successful!') },
                () => { alert('Something fucked up while saving') }
            )
    }
}
