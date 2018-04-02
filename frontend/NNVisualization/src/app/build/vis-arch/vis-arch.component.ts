import {
    Component, OnInit, OnChanges, Renderer2, ViewChild, ElementRef,
    ViewEncapsulation, Input, Output, EventEmitter
} from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService, ErrorInfo } from '../../selected-architecture/selected-architecture.service';
import { ArchNode, ArchLink } from '../../selected-architecture/architecture';
import { ToolboxLayer, layerTemplates } from './toolbox-layers';

import { Layer } from '../layers/layer/layer';
import { FullyConnectedLayer } from '../layers/fully-connected/fully-connected';
import { ConvLayer } from '../layers/conv/conv';
import { InputLayer } from '../layers/input/input';
import { PoolLayer } from '../layers/pool/pool';
import { DropoutLayer } from '../layers/dropout/dropout';
import { BatchNormLayer } from '../layers/batch-norm/batch-norm';

interface GraphNode {
    id: string;
    label: string;
    selected: boolean;
    color: string;
    tooltip: string;
    incorrect: boolean;
    x?: number;
    y?: number;
}

interface GraphLink {
    source: string;
    target: string;
}

interface NodePos {
    x: number;
    y: number;
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
    positions: Map<String, NodePos>;

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

    @ViewChild('graph') private _graph: ElementRef;

    constructor(private selArchService: SelectedArchitectureService,
        private renderer: Renderer2) {
        this.positions = new Map;
        // this._layerData = [];
    }

    ngOnInit() {
    }

    ngOnChanges(changes) {
        this._setGraphData();
        this.nodes = this.nodes.map(n => {
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
                const toolboxLayer = layerTemplates.find(
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
        this.nodes = this.nodes.map(node => {
            if (this.positions.has(node.id)) {
                const pos = this.positions.get(node.id);
                node.x = pos.x;
                node.y = pos.y;
            }
            return node;
        });
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
            this._savePostitions();
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
        this._savePostitions();
        this._setGraphData();

        this.modified.emit({ nodes: this.layers, links: this.links });
    }

    private _savePostitions() {
        this.positions = new Map;
        this.nodes.forEach(node => {
            this.positions.set(
                node.id, { x: node.x, y: node.y }
            );
        });
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

    onLayerDrop(event: { value: ToolboxLayer }): void {
        const layer: ToolboxLayer = event.value;

        const droppedLayer = this.renderer.selectRootElement('.layer.ng-star-inserted.gu-mirror');

        // find smallest free id
        let id = this.selArchService.graph.nodes.reduce((p, n) => (n > p ? n : p), 0);
        id += 1;
        this.selArchService.graph.addNode(id);

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
            case 'dropout':
                this.layers.set(id, new DropoutLayer(id, layer.shortcut));
                break;
            case 'batch_norm':
                this.layers.set(id, new BatchNormLayer(id, layer.shortcut));
                break;
        }

        this.nodes.push({
            id: String(id),
            label: layer.shortcut + ' (' + id + ')',
            selected: false,
            color: layer.color,
            tooltip: layer.label,
            incorrect: false,
            x: droppedLayer.offsetLeft - this._graph.nativeElement.offsetLeft,
            y: droppedLayer.offsetTop - this._graph.nativeElement.offsetTop
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
