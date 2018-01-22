import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';

interface GraphNode {
    id: string;
    label: string;
    selected: boolean;
    color: string;
}

interface GraphLink {
    source: string;
    target: string;
}

interface ToolboxLayer {
    label: string;
    color: string;
}

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
    // possible curves:
    //    'Bundle', 'Cardinal', 'Catmull Rom', 'Linear', 'Monotone X',
    //    'Monotone Y', 'Natural', 'Step', 'Step After', 'Step Before'
    curve: any = shape.curveCardinal;

    // graph data
    nodes: GraphNode[] = [];
    links: GraphLink[] = [];

    // toolbox data
    layers: ToolboxLayer[] = [{
        label: "Convolution",
        color: "#6666aa"
    },
    {
        label: "Fully Connected",
        color: "#00FF00"
    }]

    connectingMode = false;
    deletingMode = false;
    private _selectedSource = undefined;
    private _selectedTarget = undefined;

    // dummy counter for new nodes
    private _idCounter = 10;

    private _nodeColor = '#6666aa';

    constructor(private selArchService: SelectedArchitectureService) {
        if (selArchService.architecture) {
            this.nodes = [];
            for (let node of selArchService.architecture.nodes) {
                this.nodes.push({
                    id: node.id,
                    label: node.label,
                    selected: false,
                    color: this._nodeColor
                });
            }
            this.links = selArchService.architecture.links;
        }
    }

    ngOnInit() {
    }

    onNodeSelect(data) {
        if (this.connectingMode) {
            this.handleSelectInConnectingMode(data);
        } else if (this.deletingMode) {
            this.handleSelectInDeletingMode(data);
        }
    }

    private handleSelectInConnectingMode(data): void {
        if (!this._selectedSource) {
            // select staring node
            this._selectedSource = data;
            this._selectedSource.selected = true;
        } else if (data.id === this._selectedSource.id) {
            // if you select the same node second time
            //  just unselect it
            this._selectedSource.selected = false;
            this._selectedSource = undefined;
        } else {
            // connect two selected nodes with link
            //  but check if they weren't already connected
            this._selectedTarget = data;
            this._selectedSource.selected = false;

            if (!this.links.some(link =>
                link.source === this._selectedSource.id &&
                link.target === this._selectedTarget.id)) {
                this.links.push({
                    source: this._selectedSource.id,
                    target: this._selectedTarget.id
                });
            }

            this._selectedSource = undefined;
            this._selectedTarget = undefined;
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

    private updateView(): void {
        // HACK!
        // makes changes visible on screen
        this.nodes = [...this.nodes];
        this.links = [...this.links];
    }

    addNewNode(layer: ToolboxLayer): void {
        this.nodes.push({
            id: String(this._idCounter),
            label: String(this._idCounter),
            selected: false,
            color: layer.color
        });
        this._idCounter += 1;
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

    onLayerDrop(event: { value: ToolboxLayer}): void {
        console.log(event);
        let layer: ToolboxLayer = event.value;
        this.addNewNode(layer);
    }

    onLinkSelect(data): void {
        if (this.deletingMode) {
            this.links = this.links.filter(link =>
                link.source !== data.source ||
                link.target !== data.target
            );
            this.updateView();
        }
    }
}
