import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../material-imports.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DetailsComponent } from './details/details.component';

export { DetailsComponent };

@NgModule({
    imports: [
        CommonModule,
        MaterialImportsModule,
        FlexLayoutModule
    ],
    declarations: [
        DetailsComponent
    ],
    exports: [
        DetailsComponent
    ]
})
export class UtilsModule { }
