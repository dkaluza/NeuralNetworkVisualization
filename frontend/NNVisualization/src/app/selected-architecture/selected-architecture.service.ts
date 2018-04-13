import { Injectable } from '@angular/core';
import { Architecture, ArchNode, ArchLink } from './architecture';
import { Model } from './model';
import { Graph } from './graph';

import { Layer, archNodeToLayer } from '../build/layers/layer-stats.module';
import { InputLayer } from '../build/layers/input/input';

import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

export interface ErrorInfo {
    value: boolean;
    nodeIds: number[];
    message: string;
}

@Injectable()
export class SelectedArchitectureService {

    private _architecture: Architecture;
    private _model: Model;

    private _currentNodes: Map<number, Layer>;
    private _currentLinks: ArchLink[];
    private _graph: Graph;

    constructor(private genericDialogs: GenericDialogsService) {
        this._currentNodes = new Map;
        this._currentLinks = [];
        this._graph = new Graph();
    }

    get architecture(): Architecture {
        return this._architecture;
    }

    set architecture(newArchitecture: Architecture) {
        this._architecture = newArchitecture;
        this._model = undefined;

        if (this._architecture) {
            this._currentNodes = new Map;
            this._architecture.nodes.forEach(
                node => {
                    return this._currentNodes.set(
                        Number(node.id),
                        archNodeToLayer(node)
                    );
                }
            );
            this._currentLinks = this._architecture.links;
            this._graph = this._graphFromData(this._currentNodes,
                                              this._currentLinks);
        } else {
            this._currentNodes = new Map;
            this._currentLinks = [];
            this._graph = new Graph();
        }
    }

    get graph(): Graph {
        return this._graph;
    }

    set graph(graph: Graph) {
        this._graph = graph;
    }

    get model(): Model {
        return this._model;
    }

    set model(newModel: Model) {
        this._model = newModel;
    }

    get currentNodes(): Map<number, Layer> {
        return this._currentNodes;
    }

    set currentNodes(newNodes: Map<number, Layer>) {
        this._currentNodes = newNodes;
    }

    get currentLinks(): ArchLink[] {
        return this._currentLinks;
    }

    set currentLinks(newLinks: ArchLink[]) {
        this._currentLinks = newLinks;
    }

    private _graphFromData(nodes, links): Graph {
        const graph = new Graph();
        nodes.forEach(
            (node, id) => { graph.addNode(id); }
        );
        links.forEach(
            link => { graph.addLink(Number(link.source),
                                    Number(link.target)); }
        );
        return graph;
    }

    currentNodesToDict(): ArchNode[] {
        const ret = [];
        this._currentNodes.forEach(
            (node) => { ret.push(node.toDict()); }
        );
        return ret;
    }

    checkIfArchIsValid(silence = false): ErrorInfo {
        let error = this._checkNumOfInputs(silence);
        if (!error.value) { return error; }
        error = this._checkInputIds(silence);
        if (!error.value) { return error; }
        error = this._checkForSingleOutput(silence);
        if (!error.value) { return error; }
        error = this._checkForLoop(silence);
        if (!error.value) { return error; }
        error = this._checkShapes(silence);
        if (!error.value) { return error; }
        error = this._checkSharingWeights(silence);
        if (!error.value) { return error; }

        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }

    private _correctGraphInfo(): ErrorInfo {
        return { value: true, nodeIds: [], message: '' };
    }

    private _wrongGraphInfo(nodes: number[], message: string): ErrorInfo {
        return { value: false, nodeIds: nodes, message: message };
    }


    private _checkInputIds(silence: boolean): ErrorInfo {
        const inputs = this._graph.getGraphInputs();
        const inputIds = inputs.map(n => {
            const l = this._currentNodes.get(n) as InputLayer;
            return l.inputId;
        }).sort();

        let message = '';
        for (let i = 1; i <= inputIds.length; i += 1) {
            const pos = i - 1;
            if (i !== inputIds[pos]) {
                if (i < inputIds[pos]) {
                    message = 'Input number ' + i + ' is missing!';
                } else { // i > inputIds[pos]
                    message = 'Input number ' + inputIds[pos] + ' appears multiple times!';
                }
                if (!silence) {
                    this.genericDialogs.createWarning(message);
                }
                return this._wrongGraphInfo(inputs, message);
            }
        }
        return this._correctGraphInfo();
    }

    private _checkNumOfInputs(silence: boolean): ErrorInfo {
        const incorrectNodes = [];
        for (const id of Array.from(this._currentNodes.keys())) {
            const layer = this._currentNodes.get(id);
            const numOfInputs = this._graph.getNodeInputs(id).length;
            if (layer.getMinNumOfInputs() !== undefined) {
                if (layer.getMinNumOfInputs() > numOfInputs) {
                    incorrectNodes.push(id);
                    break;
                }
            }
            if (layer.getMaxNumOfInputs() !== undefined) {
                if (layer.getMaxNumOfInputs() < numOfInputs) {
                    incorrectNodes.push(id);
                }
            }
        }
        let message = '';
        if (incorrectNodes.length > 0) {
            message = 'Nodes (';
            for (let i = 0; i < incorrectNodes.length - 1; i += 1) {
                message += (incorrectNodes[i] + ',');
            }
            message += incorrectNodes[incorrectNodes.length - 1];
            message += ') have wrong number of inputs';
            if (!silence) {
                this.genericDialogs.createWarning(message);
            }
        }
        return {
            value: incorrectNodes.length === 0,
            nodeIds: incorrectNodes,
            message: message
        };
    }

    private _checkForSingleOutput(silence: boolean): ErrorInfo {
        const outputs = this._graph.getGraphOutputs();
        if (outputs.length !== 1) {
            const message = 'Network should have 1 output!';
            if (!silence) {
                this.genericDialogs.createWarning(message);
            }
            return this._wrongGraphInfo(outputs, message);
        }
        return this._correctGraphInfo();
    }

    private _checkForLoop(silence: boolean): ErrorInfo {
        const loop = this._graph.checkForLoop();
        if (loop.length > 0) {
            const message = 'There exists a loop';
            if (!silence) {
                this.genericDialogs.createWarning(message);
            }
            return this._wrongGraphInfo(loop, message);
        }
        return this._correctGraphInfo();
    }

    private _checkShapes(silence: boolean): ErrorInfo {
        const sorted = this._graph.sortTopologically();
        const shapes = new Map();

        for (const n of sorted) {
            const layer = this._currentNodes.get(n);
            const inputs = [];

            this._graph.getNodeInputs(n).forEach(v => {
                inputs.push(shapes.get(v));
            });
            if (layer.validateInputShapes(inputs)) {
                shapes.set(n, layer.calculateOutputShape(inputs));
                layer.inputShapes = inputs;
            } else {
                const message = 'Node ' + n + ' has incorrect inputs: ' + inputs;
                if (!silence) {
                    this.genericDialogs.createWarning(message);
                }
                return this._wrongGraphInfo([n], message);
            }
        }

        return this._correctGraphInfo();
    }

    private _checkSharingWeights(silence: boolean): ErrorInfo {
        for (const node of this._graph.nodes) {
            const nodeLayer = this._currentNodes.get(node);
            if (nodeLayer.shareWeightsFrom) {
                let message = '';

                const sharedId = nodeLayer.shareWeightsFrom;
                const sharedLayer = this._currentNodes.get(sharedId);
                if (!nodeLayer.canShareWeightFrom(sharedLayer)) {
                    message = 'Node ' + node + ' can\'t share weights from ' + sharedId;
                    if (!silence) {
                        this.genericDialogs.createWarning(message);
                    }
                    return this._wrongGraphInfo([node], message);
                }
            }
        }
        return this._correctGraphInfo();
    }
}
