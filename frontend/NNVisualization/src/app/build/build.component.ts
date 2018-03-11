import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { Restangular } from 'ngx-restangular';

import { VisArchComponent } from '../vis-arch/vis-arch.component';

import { ArchNode, ArchLink } from '../selected-architecture/architecture';

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
        if (this.selArchService.currentNodes) {
            this.nodes = this.selArchService.currentNodes;
            this.links = this.selArchService.currentLinks;
        } else if (this.selArchService.architecture) {
            this.nodes = new Map;
            this.selArchService.architecture.nodes.forEach(
                node => {
                    return this.nodes.set(
                        Number(node.id),
                        this._archNodeToLayer(node));
                }
            );
            this.links = this.selArchService.architecture.links;

            this.selArchService.currentNodes = this.nodes;
            this.selArchService.currentLinks = this.links;
        } else {
            this.nodes = new Map;
            this.links = [];
        }
    }

    private _archNodeToLayer(node: ArchNode): Layer {
        switch (node.layerType) {
            case 'fc':
                return FullyConnectedLayer.fromDict(node);
            case 'conv':
                return ConvLayer.fromDict(node);
            case 'input':
                return InputLayer.fromDict(node);
            default:
                return undefined;
        }
    }

    private _unselectNode(): void {
        this.selectedLayer = undefined;
        this.selectedID = undefined;
    }

    onGraphModified(data): void {
        this.selArchService.currentNodes = data.nodes;
        this.selArchService.currentLinks = data.links;
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
        this.nodes = new Map;
        this.selArchService.architecture.nodes.forEach(
            node => {
                return this.nodes.set(
                    Number(node.id),
                    this._archNodeToLayer(node));
            }
        );
        this.links = this.selArchService.architecture.links;

        this.selArchService.currentNodes = this.nodes;
        this.selArchService.currentLinks = this.links;

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
                    (nArch) => { },
                    () => { alert('Error :('); }
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
                () => { this.genericDialogs.createSuccess('Save successful!'); },
                () => { this.genericDialogs.createWarning('Something went wrong while saving!', 'Warning!'); }
            );
    }
}
