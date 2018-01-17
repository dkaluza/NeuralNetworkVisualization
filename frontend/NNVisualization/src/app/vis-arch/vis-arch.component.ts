import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as shape from 'd3-shape';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
// import { colorSets } from '../src/utils/color-sets';
// import { countries, generateHierarchialGraph, getTurbineData } from './data';
// import chartGroups from './chartTypes';
// import { id } from '../src/utils/id';

@Component({
    selector: 'app-vis-arch',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./vis-arch.component.css'],
    templateUrl: './vis-arch.component.html'
})
export class VisArchComponent implements OnInit {

    // version = APP_VERSION;

    theme = 'dark';
    chartType = 'directed-graph';
    chartGroups: any;
    chart: any;
    realTimeData: boolean = false;
    countries: any[];
    graph: { links: any[], nodes: any[] };
    hierarchialGraph: { links: any[], nodes: any[] };

    view: any[];
    width: number = 700;
    height: number = 700;
    fitContainer: boolean = true;
    autoZoom: boolean = false;

    // options
    showLegend = false;
    orientation: string = 'LR'; // LR, RL, TB, BT

    // line interpolation
    curveType: string = 'Bundle';
    curve: any = shape.curveLinear;
    interpolationTypes = [
        'Bundle', 'Cardinal', 'Catmull Rom', 'Linear', 'Monotone X',
        'Monotone Y', 'Natural', 'Step', 'Step After', 'Step Before'
    ];

    colorSets: any;
    colorScheme = {
        name: 'vivid',
        selectable: true,
        group: 'Ordinal',
        domain: [
           '#647c8a', '#3f51b5', '#2196f3', '#00b862', '#afdf0a', '#a7b61a', '#f3e562', '#ff9800', '#ff5722', '#ff4514'
        ]
    };
    schemeType: string = 'ordinal';
    selectedColorScheme: string;

    nodes = [];
    links = [];

    connectingMode = false;
    selectedSource = undefined;
    selectedTarget = undefined;

    deletingMode = false;

    idCounter = 10;

    constructor(private selArchService: SelectedArchitectureService) {
        if (selArchService.architecture) {
            this.nodes = selArchService.architecture.nodes;
            this.links = selArchService.architecture.links;
            this.nodes = this.nodes.map(node => {
                node.selected = false;
                return node;
            });
        } else {
            this.nodes = [];
            this.links = [];
        }
        this.view = undefined;
    }

    ngOnInit() {
        // if (!this.fitContainer) {
        //     this.applyDimensions();
        // }
    }

    // applyDimensions() {
    //     this.view = [this.width, this.height];
    // }

    // toggleFitContainer(fitContainer: boolean, autoZoom: boolean): void {
    //     this.fitContainer = fitContainer;
    //     this.autoZoom = autoZoom;

    //     if (this.fitContainer) {
    //         this.view = undefined;
    //     } else {
    //         this.applyDimensions();
    //     }
    // }

    select(data) {
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
            selected: false
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
}
