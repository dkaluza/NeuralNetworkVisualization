import { Component, OnInit, OnChanges,
         ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService, ErrorInfo } from '../../selected-architecture/selected-architecture.service';
import { ArchNode, ArchLink } from '../../selected-architecture/architecture';
import { ToolboxLayer, layerTemplates } from './toolbox-layers';

import { Layer, toolboxLayerToLayer } from '../layers/layer-stats.module';

interface GraphNode {
    id: string;
    label: string;
    selected: boolean;
    color: string;
    tooltip: string;
    incorrect: boolean;
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
    @Input() graphErrorInfo: ErrorInfo;
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

    // stores information abouts layers
    // private _layerData: { [id: number]: Layer };
    // private _layerData: Layer[];

    // used for architecture manipulations
    connectingMode = false;
    deletingMode = false;
    private _selectedSource = undefined;
    private _selectedTarget = undefined;
    selectedNodeId: string;

    // used for drag 'n' drop
    toolboxLayers = layerTemplates;

    constructor(private selArchService: SelectedArchitectureService) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes) {
        this._setGraphData();
        this.nodes = this.nodes.map( n => {
            if (this.graphErrorInfo.nodeIds.indexOf(Number(n.id)) > -1) {
                n.incorrect = true;
            }
            return n;
        });
    }

    private _setGraphData(): void {
        this.nodes = this.selArchService.graph.nodes.map(
            n => {
                const layer = this.layers.get(n);
                const toolboxLayer =  layerTemplates.find(
                    l => (l.id === layer.layerType)
                );
                return {
                    id: String(layer.id),
                    label: layer.label + ' (' + layer.id + ')',
                    selected: false,
                    color: toolboxLayer.color,
                    tooltip: toolboxLayer.label,
                    incorrect: false
                };
            }
        );
        this.links = this.selArchService.graph.links;
    }

    onNodeSelect(data) {
        if (this.connectingMode) {
            this._handleSelectInConnectionMode(data);
        } else if (this.deletingMode) {
            this._handleSelectInDeletionMode(data);
        } else {
            // this.selectedLayer = this.layers.get(Number(data.id));
            this.selectedNodeId = data.id;
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

            this.selArchService.graph.addLink(Number(this._selectedSource.id),
                                              Number(this._selectedTarget.id));

            this._selectedSource = undefined;
            this._selectedTarget = undefined;
            this._updateView();
        }
    }

    private _handleSelectInDeletionMode(data): void {
        const id = Number(data.id);

        this.selArchService.graph.removeNode(id);
        this.layers.delete(id);

        this._updateView();
    }

    private _updateView(): void {
        this._setGraphData();

        this.modified.emit({nodes: this.layers, links: this.links});
    }

    toggleLinking(): void {
        this.deletingMode = false;
        // unselect node
        this.selectedNodeId = undefined;
        this.nodeSelected.emit(undefined);
    }

    toggleDeleting(): void {
        this.connectingMode = false;
        this.nodes = this.nodes.map(node => {
            node.selected = false;
            return node;
        });
        // unselect node
        this.selectedNodeId = undefined;
        this.nodeSelected.emit(undefined);
    }

    onLayerDrop(event: { value: ToolboxLayer}): void {
        const layer: ToolboxLayer = event.value;

        // find smallest free id
        let id = this.selArchService.graph.nodes.reduce((p, n) => (n > p ? n : p), 0);
        id += 1;
        this.selArchService.graph.addNode(id);

        this.layers.set(id, toolboxLayerToLayer(layer, id));

        this.nodes.push({
            id: String(id),
            label: layer.shortcut + ' (' + id + ')',
            selected: false,
            color: layer.color,
            tooltip: layer.label,
            incorrect: false
        });
        this._updateView();
        this.nodeSelected.emit(id);
    }

    onLinkSelect(data): void {
        if (this.deletingMode) {
            this.selArchService.graph.removeLink(Number(data.source),
                                                 Number(data.target));
            this._updateView();
        }
    }

    update() {
        this._updateView();
    }
}
