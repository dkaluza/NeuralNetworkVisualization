import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

@Component({
    selector: 'app-vis-arch',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./vis-arch.component.css'],
    templateUrl: './vis-arch.component.html'
})
export class VisArchComponent implements OnInit {

    // options
    orientation = 'LR'; // LR, RL, TB, BT

    // line interpolation
    curve: any = shape.curveCardinal;
    interpolationTypes = [
        'Bundle', 'Cardinal', 'Catmull Rom', 'Linear', 'Monotone X',
        'Monotone Y', 'Natural', 'Step', 'Step After', 'Step Before'
    ];

    // graph data
    nodes: any[] = [];
    links: any[] = [];

    connectingMode = false;
    deletingMode = false;
    selectedSource = undefined;
    selectedTarget = undefined;

    // dummy counter for new nodes
    idCounter = 10;

    constructor(private selArchService: SelectedArchitectureService) {
        if (selArchService.architecture) {
            this.nodes = selArchService.architecture.nodes;
            this.links = selArchService.architecture.links;
            this.nodes = this.nodes.map(node => {
                node.selected = false;
                node.color = '#ff5722';
                return node;
            });
        }
    }

    ngOnInit() {
    }

    onNodeSelect(data) {
        console.log('Item clicked', data);

        if (this.connectingMode) {
            this.handleSelectInConnectingMode(data);
        } else if (this.deletingMode) {
            this.handleSelectInDeletingMode(data);
        }
    }

    private handleSelectInConnectingMode(data): void {
        if (!this.selectedSource) {
            // select staring node
            this.selectedSource = data;
            this.selectedSource.selected = true;
        } else if (data.id === this.selectedSource.id) {
            // if you select the same node second time
            //  just unselect it
            this.selectedSource.selected = false;
            this.selectedSource = undefined;
        } else {
            // connect two selected nodes with link
            //  but check if they weren't already connected
            this.selectedTarget = data;
            this.selectedSource.selected = false;

            if (!this.links.some(link =>
                    link.source === this.selectedSource.id &&
                    link.target === this.selectedTarget.id)) {
                this.links.push({
                    source: this.selectedSource.id,
                    target: this.selectedTarget.id
                });
            }

            this.selectedSource = undefined;
            this.selectedTarget = undefined;
            this.updateView();
        }
    }

    private handleSelectInDeletingMode(data): void {
        this.links = this.links.filter(link =>
            link.source !== data.id &&
            link.target !== data.id
        );
        this.nodes = this.nodes.filter(node =>
            node.id !== data.id
        );
        this.updateView();
    }

    onLegendLabelClick(entry) {
        console.log('Legend clicked', entry);
    }

    toggleExpand(node) {
        console.log('toggle expand', node);
    }

    private updateView(): void {
        // HACK!
        // makes changes visible on screen
        this.nodes = [...this.nodes];
        this.links = [...this.links];
    }

    addNewNode(): void {
        this.nodes.push({
            id: String(this.idCounter),
            label: String(this.idCounter),
            selected: false,
            color: '#ff5722'
        });
        this.idCounter += 1;
        this.updateView();
    }

    toggleLinking(): void {
        this.deletingMode = false;
    }

    toggleDeleting(): void {
        this.connectingMode = false;
        this.nodes = this.nodes.map(node => {
            node.selected = false;
            return node;
        });
    }

    onLinkSelect(data): void {
        console.log('Link selected: ', data);

        if (this.deletingMode) {
            this.links = this.links.filter(link =>
                link.source !== data.source ||
                link.target !== data.target
            );
            this.updateView();
        }
    }
}
