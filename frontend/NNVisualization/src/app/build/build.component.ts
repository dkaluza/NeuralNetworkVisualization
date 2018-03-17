import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';

import { VisArchComponent } from '../vis-arch/vis-arch.component';

import { Architecture, ArchNode, ArchLink } from '../selected-architecture/architecture';

import { Layer } from '../vis-arch/layers/layer/layer';
import { FullyConnectedLayer } from '../vis-arch/layers/fully-connected/fully-connected';
import { ConvLayer } from '../vis-arch/layers/conv/conv';
import { InputLayer } from '../vis-arch/layers/input/input';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

@Component({
    selector: 'app-build',
    templateUrl: './build.component.html',
    styleUrls: ['./build.component.css']
})
export class BuildComponent implements OnInit {

    nodes: Map<number, Layer>;
    links: ArchLink[];
    hasNodesBeenModified = false;

    selectedLayer: Layer;
    private selectedID: number;

    constructor(private selArchService: SelectedArchitectureService,
        private restangular: Restangular,
        private genericDialogs: GenericDialogsService) {
    }

    ngOnInit() {
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;
    }

    private _unselectNode(): void {
        this.selectedLayer = undefined;
        this.selectedID = undefined;
    }

    onGraphModified(data): void {
        this.selArchService.currentNodes = data.nodes;
        this.selArchService.currentLinks = data.links;

        this.nodes = data.nodes;
        this.links = data.links;
    }

    onNodeSelected(id): void {
        this.selectedLayer = this.nodes.get(id);
        this.selectedID = id;
    }

    onNodeUpdate(): void {
        this.hasNodesBeenModified = !this.hasNodesBeenModified;
        // this.hasNodesBeenModified = true;
    }

    clearCurrentArch(): void {
        this.selArchService.currentNodes.clear();
        this.selArchService.currentLinks = [];
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;

        this._unselectNode();
    }

    resetArch(): void {
        // this line sets currentNodes and currentLinks to those in selected architecture
        this.selArchService.architecture = this.selArchService.architecture;
        this.nodes = this.selArchService.currentNodes;
        this.links = this.selArchService.currentLinks;

        this._unselectNode();
    }

    saveCurrentArch() {
        if (this.selArchService.architecture) {
            const arch = this.selArchService.architecture;

            const data = {
                graph: {
                    nodes: this.selArchService.currentNodesToDict(),
                    links: this.selArchService.currentLinks
                }
            };
            this.restangular.all('arch').all(arch.id)
                .post(data).subscribe(
                    (nArch) => { this.genericDialogs.createSuccess('Save successful!'); },
                    () => { this.genericDialogs.createWarning('Something went wrong while saving!', 'Warning!'); }
                );
        }
    }

    saveAsNewArch() {
        this.genericDialogs.createInputs(['Name', 'Description']).afterClosed().subscribe(
            result => {
                if (result && result['Name']) {
                    this._saveAsNewArchWithNameAndDesc(result['Name'], result['Description']);
                }
            }
        );
    }

    private _saveAsNewArchWithNameAndDesc(name: string, desc: string) {
        const data = {
            name: name,
            description: desc,
            graph: {
                nodes: this.selArchService.currentNodesToDict(),
                links: this.selArchService.currentLinks
            }
        };

        this.restangular.all('upload_arch')
            .post(data).subscribe(
                arch => {
                    const newArch = new Architecture(
                        arch.id, arch.name,
                        arch.description,
                        arch.architecture.nodes,
                        arch.architecture.links,
                        arch.last_used,
                        arch.last_modified
                    );
                    this.selArchService.architecture = newArch;
                    this.genericDialogs.createSuccess('Save successful!');
                },
                e => { this.genericDialogs.createWarning('Something went wrong while saving!', 'Warning!'); }
            );
    }
}
