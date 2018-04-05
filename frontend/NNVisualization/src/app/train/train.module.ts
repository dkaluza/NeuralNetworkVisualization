import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../material-imports.module';
import { TrainComponent } from './train.component';
import { TrainedModelsComponent } from './trained-models/trained-models.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

export { TrainComponent };


@NgModule({
    imports: [
        CommonModule,
        MaterialImportsModule,
        FormsModule,
        FlexLayoutModule
    ],
    declarations: [
        TrainComponent,
        TrainedModelsComponent
    ],
    exports: [
        TrainComponent
    ]
})
export class TrainModule { }
