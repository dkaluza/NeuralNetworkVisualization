import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialImportsModule } from '../material-imports.module';
import { LayerStatsModule } from './layers/layer-stats.module';

import { BuildComponent } from './build.component';
import { VisArchComponent } from './vis-arch/vis-arch.component';

import { CurrentArchService } from './current-arch.service';

export { BuildComponent };

@NgModule({
    declarations: [
        VisArchComponent,
        BuildComponent
    ],
    imports: [
        CommonModule,
        LayerStatsModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialImportsModule,
        NgxChartsModule,
        NgxGraphModule,
        NgxDnDModule,
        FlexLayoutModule
    ],
    exports: [BuildComponent],
    providers: [CurrentArchService]
})
export class BuildModule { }
