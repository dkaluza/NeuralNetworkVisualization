import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { ToolboxLayer, layers } from './toolbox-layers';
import { Graph } from './graph';

import { Layer, Activation } from './layers/layer/layer';
import { FullyConnectedLayer } from './layers/fully-connected/fully-connected';

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
    curve: any = shape.curveMonotoneX;

    // graph data
    nodes: GraphNode[] = [];
    links: GraphLink[] = [];

    private _graph: Graph;
    private _layerData: Layer[];

    connectingMode = false;
    deletingMode = false;
    private _selectedSource = undefined;
    private _selectedTarget = undefined;

    toolboxLayers = layers;

    selectedLayer: Layer;

    constructor(private selArchService: SelectedArchitectureService) {
        this._graph = new Graph();
        this._layerData = [];
        this.selectedLayer = undefined;
    }

    ngOnInit() {
        if (this.selArchService.currentNodes) {
            this._readGraph(this.selArchService.currentNodes,
                            this.selArchService.currentLinks);
        } else if (this.selArchService.architecture) {
            this._readGraph(this.selArchService.architecture.nodes,
                            this.selArchService.architecture.links);
        }
    }

    private _readGraph(nodes, links): void {
        nodes.forEach(
            node => { this._graph.addNode(Number(node.id)); }
        );
        links.forEach(
            link => { this._graph.addLink(link.source, link.target); }
        );

        // this._layerData = nodes.map(this._createLayerFromDict);
        this._setGraphData();
    }

    private _setGraphData(): void {
        this.nodes = this._graph.nodes.map(
            n => {
                const layer = this._layerData[n];
                const color = layers.find(
                    (l) => (l.id === 'fc')
                ).color;
                return {
                    id: String(layer.id),
                    label: layer.label,
                    selected: false,
                    color: color
                };
            }
        );
        this.links = this._graph.links;
        this.updateView();
    }

    onNodeSelect(data) {
        if (this.connectingMode) {
            this.handleSelectInConnectingMode(data);
        } else if (this.deletingMode) {
            this.handleSelectInDeletingMode(data);
        } else {
            this.selectedLayer = this._layerData[Number(data.id)] as FullyConnectedLayer;
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

        this.selArchService.currentNodes = this.nodes.map(
            (node) =>  ({id: node.id, label: node.label})
        );
        this.selArchService.currentLinks = this.links;
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

    onLayerDrop(event: {value: ToolboxLayer}): void {
        console.log(event);
        const layer: ToolboxLayer = event.value;

        // find smallest free id
        let id = this._graph.nodes.reduce((p, n) => (n > p ? n : p), 0);
        id += 1;
        this._graph.addNode(id);

        switch (layer.id) {
            case 'fc':
                this._layerData[id] = new FullyConnectedLayer(id, layer.shortcut, [1], [1]);
                break;
        }

        this.nodes.push({
            id: String(id),
            label: layer.shortcut,
            selected: false,
            color: layer.color
        });
        this.updateView();
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

    update(id) {
        console.log('update ' + id);
        this._setGraphData();
    }
}
