import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';

export interface LossFunction {
    name: string;
    id: string;
}

export interface OptimizerParam {
    name: string;
    id: string;
    value: number;
}

export interface Optimizer {
    name: string;
    id: string;
    params: OptimizerParam[];
}

@Injectable()
export class TrainParamsService {
    private _losses: Map<string, LossFunction>;
    private _optimizers: Map<string, Optimizer>;

    constructor(private restangular: Restangular) {
        this._loadLosses();
        this._loadOptimizers();
    }

    getLoss(id: string): LossFunction {
        return this._losses.get(id);
    }

    getOptimizer(id: string): Optimizer {
        return this._optimizers.get(id);
    }

    listLosses(): LossFunction[] {
        const losses = [];
        this._losses.forEach(loss => {
            losses.push(loss);
        });
        return losses;
    }

    listOptimizers(): Optimizer[] {
        const optimizers = [];
        this._optimizers.forEach(opt => {
            optimizers.push(opt);
        });
        return optimizers;
    }

    private _loadLosses() {
        this._losses = new Map;
        this.restangular.all('list_losses')
            .getList().subscribe(losses => {
                losses.forEach(loss => {
                    this._losses.set(loss.id, loss);
                });
            });
    }

    private _loadOptimizers() {
        this._optimizers = new Map;
        this.restangular.all('list_optimizers')
            .getList().subscribe(optimizers => {
                optimizers.forEach(opt => {
                    this._optimizers.set(opt.id, opt);
                });
            });
    }
}
