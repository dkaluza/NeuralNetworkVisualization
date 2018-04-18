import { Component, OnInit, OnChanges,
         ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import * as shape from 'd3-shape';

import { CurrentArchService, ErrorInfo } from '../current-arch.service';
import { ArchNode, ArchLink } from '../../selected-architecture/architecture';
import { ToolboxLayer, layerTemplates } from './toolbox-layers';

import { Layer } from '../layers/layer-stats.module';

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
    // @Input() layers: Map<number, Layer>;
    @Input() graphErrorInfo: ErrorInfo;
    // @Input() connections: ArchLink[];
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

    // used for architecture manipulations
    connectingMode = false;
    deletingMode = false;
    private _selectedSource = undefined;
    private _selectedTarget = undefined;
    selectedNodeId: string;

    // used for drag 'n' drop
    toolboxLayers = layerTemplates;

    constructor(private currentArch: CurrentArchService) { }

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
        this.nodes = this.currentArch.nodes.map(
            n => {
                const layer = this.currentArch.layers.get(n);
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
        this.links = this.currentArch.links;
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

            this.currentArch.addLink(
                Number(this._selectedSource.id),
                Number(this._selectedTarget.id)
            );

            this._selectedSource = undefined;
            this._selectedTarget = undefined;
            this._updateView();
        }
    }

    private _handleSelectInDeletionMode(data): void {
        const id = Number(data.id);

        this.currentArch.removeNode(id);
        this._updateView();
    }

    private _updateView(): void {
        this._setGraphData();

        this.modified.emit();
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
        const layerType: ToolboxLayer = event.value;
        const id = this.currentArch.addNodeFromToolboxLayer(layerType);

        this._updateView();
        this.nodeSelected.emit(id);
    }

    onLinkSelect(data): void {
        if (this.deletingMode) {
            this.currentArch.removeLink(
                Number(data.source),
                Number(data.target)
            );
            this._updateView();
        }
    }
}
