import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialImportsModule } from '../material-imports.module';
import { LayerStatsModule } from './layers/layer-stats.module';

import { BuildComponent } from './build.component';
import { VisArchComponent } from './vis-arch/vis-arch.component';

import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';
import { GenericDialogsService } from '../generic-dialogs/generic-dialogs.service';

export { BuildComponent };

@NgModule({
    declarations: [
        VisArchComponent,
        BuildComponent
    ],
    imports: [
        BrowserModule,
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
    providers: [
        SelectedArchitectureService,
        GenericDialogsService
    ]
})
export class BuildModule { }
