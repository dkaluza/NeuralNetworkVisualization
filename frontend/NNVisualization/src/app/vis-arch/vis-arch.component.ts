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
    height: number = 300;
    fitContainer: boolean = true;
    autoZoom: boolean = false;

    // options
    showLegend = false;
    orientation: string = 'LR'; // LR, RL, TB, BT

    orientations: any[] = [
        {
            label: 'Left to Right',
            value: 'LR'
        }, {
            label: 'Right to Left',
            value: 'RL'
        }, {
            label: 'Top to Bottom',
            value: 'TB'
        }, {
            label: 'Bottom to Top',
            value: 'BT'
        }
    ];

    // line interpolation
    curveType: string = 'Linear';
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

    nodes = [
        {
            id: 'start',
            label: 'start'
        }, {
            id: '1',
            label: 'node numero uno'
        }
    ];
    links = [
        {
            source: 'start',
            target: '1',
            label: ''
        }
    ];

    constructor(private selArchService: SelectedArchitectureService) {
        if (selArchService.architecture) {
            this.nodes = selArchService.architecture.nodes;
            this.links = selArchService.architecture.links;
        } else {
            this.nodes = [];
            this.links = [];

        }
    }

    ngOnInit() {
        if (!this.fitContainer) {
            this.applyDimensions();
        }
    }

    applyDimensions() {
        this.view = [this.width, this.height];
    }

    toggleFitContainer(fitContainer: boolean, autoZoom: boolean): void {
        this.fitContainer = fitContainer;
        this.autoZoom = autoZoom;

        if (this.fitContainer) {
            this.view = undefined;
        } else {
            this.applyDimensions();
        }
    }

    select(data) {
        console.log('Item clicked', data);
    }

    onLegendLabelClick(entry) {
        console.log('Legend clicked', entry);
    }

    toggleExpand(node) {
        console.log('toggle expand', node);
    }

}
