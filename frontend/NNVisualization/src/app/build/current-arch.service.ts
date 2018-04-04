import { Injectable } from '@angular/core';

import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';
import { Architecture, ArchLink, ArchNode } from '../selected-architecture/architecture';

import { Layer, archNodeToLayer } from '../build/layers/layer-stats.module';
import { InputLayer } from './layers/input/input';
import { Graph } from './graph';

export interface ErrorInfo {
    value: boolean;
    nodeIds: number[];
    message: string;
}

@Injectable()
export class CurrentArchService {

    private _layers: Map<number, Layer>;
    private _graph: Graph;
    private _architectureId: number;

    constructor(private genericDialogs: GenericDialogsService) {
        this._layers = new Map;
        this._graph = new Graph();
        this._architectureId = undefined;
    }

    get layers(): Map<number, Layer> {
        return this._layers;
    }

    get links(): ArchLink[] {
        return this._graph.links;
    }

    get nodes(): number[] {
        return this._graph.nodes;
    }

    get archId(): number {
        return this._architectureId;
    }

    addNode(node: ArchNode) {
        this._layers.set(
            Number(node.id),
            archNodeToLayer(node)
        );
        this._graph.addNode(Number(node.id));
    }

    removeNode(id: number) {
        this._layers.delete(id);
        this._graph.removeNode(id);
    }

    addLink(source: number, target: number) {
        this._graph.addLink(source, target);
    }

    removeLink(source: number, target: number) {
        this._graph.removeLink(source, target);
    }

    setArchitecture(architecture: Architecture) {
        if (architecture) {
            this._architectureId = architecture.id;
            this._layers = new Map;
            architecture.nodes.forEach(
                node => {
                    return this._layers.set(
                        Number(node.id),
                        archNodeToLayer(node)
                    );
                }
            );
            this._graph = this._graphFromData(
                this._layers,
                architecture.links
            );
        } else {
            this._architectureId = undefined;
            this._layers = new Map;
            this._graph = new Graph();
        }
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

    toDict() {
        const ret = {
            nodes: [],
            links: this._graph.links
        };
        this._layers.forEach(
            (node) => { ret.nodes.push(node.toDict()); }
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

        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }

    private _checkInputIds(silence: boolean): ErrorInfo {
        const inputs = this._graph.getGraphInputs();
        const inputIds = inputs.map(n => {
            const l = this._layers.get(n) as InputLayer;
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
                return {
                    value: false,
                    nodeIds: inputs,
                    message: message
                };
            }
        }
        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }

    private _checkNumOfInputs(silence: boolean): ErrorInfo {
        const incorrectNodes = [];
        for (const id of Array.from(this._layers.keys())) {
            const layer = this._layers.get(id);
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
            return {
                value: false,
                nodeIds: outputs,
                message: message
            };
        }
        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }

    private _checkForLoop(silence: boolean): ErrorInfo {
        const loop = this._graph.checkForLoop();
        if (loop.length > 0) {
            const message = 'There exists a loop';
            if (!silence) {
                this.genericDialogs.createWarning(message);
            }
            return {
                value: false,
                nodeIds: loop,
                message: message
            };
        }
        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }

    private _checkShapes(silence: boolean): ErrorInfo {
        const sorted = this._graph.sortTopologically();
        const shapes = new Map();

        for (const n of sorted) {
            const layer = this._layers.get(n);
            const inputs = [];
            this._graph.getNodeInputs(n).forEach(v => {
                inputs.push(shapes.get(v));
            });
            if (layer.validateInputShapes(inputs)) {
                shapes.set(n, layer.calculateOutputShape(inputs));
            } else {
                const message = 'Node ' + n + ' has incorrect inputs: ' + inputs;
                if (!silence) {
                    this.genericDialogs.createWarning(message);
                }
                return {
                    value: false,
                    nodeIds: [n],
                    message: message
                };
            }
        }

        return {
            value: true,
            nodeIds: [],
            message: ''
        };
    }
}
