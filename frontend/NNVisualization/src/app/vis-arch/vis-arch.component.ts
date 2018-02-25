import { Component, OnInit, OnChanges,
         ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { ArchNode, ArchLink } from '../selected-architecture/architecture';
import { ToolboxLayer, layerTemplates } from './toolbox-layers';
import { Graph } from './graph';

import { Layer, Activation } from './layers/layer/layer';
import { FullyConnectedLayer } from './layers/fully-connected/fully-connected';
import { ConvLayer } from './layers/conv/conv';
import { InputLayer } from './layers/input/input';
import { PoolLayer } from './layers/pool/pool';

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
export class VisArchComponent implements OnInit, OnChanges {
    @Input() layers: Map<number, Layer>;
    @Input() connections: ArchLink[];
    @Input() hasLayersBeenModified: boolean;

    @Output() modified = new EventEmitter();
    @Output() nodeSelected = new EventEmitter();

    // options
    orientation = 'LR'; // LR, RL, TB, BT

    // line interpolation
    // possible curves:
    //    'Bundle', 'Cardinal', 'Catmull Rom', 'Linear', 'Monotone X',
    //    'Monotone Y', 'Natural', 'Step', 'Step After', 'Step Before'
    curve: any = shape.curveMonotoneX;

    // this is data for visualizing architecture
    nodes: GraphNode[] = [];
    links: GraphLink[] = [];

    // stores only graph structure
    private _graph: Graph;
    // stores information abouts layers
    // private _layerData: { [id: number]: Layer };
    // private _layerData: Layer[];

    // used for architecture manipulations
    connectingMode = false;
    deletingMode = false;
    private _selectedSource = undefined;
    private _selectedTarget = undefined;

    // used for drag 'n' drop
    toolboxLayers = layerTemplates;

    constructor(private selArchService: SelectedArchitectureService) {
        this._graph = new Graph();
        // this._layerData = [];
    }

    ngOnInit() {
    }

    ngOnChanges(changes) {
        console.log('OnChanges');

        this._graph = new Graph();
        this.layers.forEach(
            (node, id) => { this._graph.addNode(id); }
        );
        this.connections.forEach(
            link => { this._graph.addLink(Number(link.source),
                                          Number(link.target)); }
        );

        this._setGraphData();
    }

    private _setGraphData(): void {
        this.nodes = this._graph.nodes.map(
            n => {
                const layer = this.layers.get(n);
                const color = layerTemplates.find(
                    l => (l.id === layer.layerType)
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
    }

    onNodeSelect(data) {
        if (this.connectingMode) {
            this._handleSelectInConnectionMode(data);
        } else if (this.deletingMode) {
            this._handleSelectInDeletionMode(data);
        } else {
            // this.selectedLayer = this.layers.get(Number(data.id));
            this.nodeSelected.emit(Number(data.id));
        }
    }

    private _handleSelectInConnectionMode(data): void {
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

            this._graph.addLink(Number(this._selectedSource.id),
                                Number(this._selectedTarget.id));

            this._selectedSource = undefined;
            this._selectedTarget = undefined;
            this._updateView();
        }
    }

    private _handleSelectInDeletionMode(data): void {
        const id = Number(data.id);

        this._graph.removeNode(id);
        this.layers.delete(id);

        this._updateView();
    }

    private _updateView(): void {
        this._setGraphData();

        this.modified.emit({nodes: this.layers, links: this.links});
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
        const layer: ToolboxLayer = event.value;

        // find smallest free id
        let id = this._graph.nodes.reduce((p, n) => (n > p ? n : p), 0);
        id += 1;
        this._graph.addNode(id);

        switch (layer.id) {
            case 'fc':
                this.layers.set(id, new FullyConnectedLayer(id, layer.shortcut));
                break;
            case 'conv':
                this.layers.set(id, new ConvLayer(id, layer.shortcut));
                break;
            case 'input':
                this.layers.set(id, new InputLayer(id, layer.shortcut));
                break;
            case 'pool':
                this.layers.set(id, new PoolLayer(id, layer.shortcut));
                break;
        }

        this.nodes.push({
            id: String(id),
            label: layer.shortcut,
            selected: false,
            color: layer.color
        });
        this._updateView();
        this.nodeSelected.emit(id);
    }

    onLinkSelect(data): void {
        if (this.deletingMode) {
            this._graph.removeLink(Number(data.source),
                                   Number(data.target));
            this._updateView();
        }
    }

    update() {
        this._updateView();
    }
}
