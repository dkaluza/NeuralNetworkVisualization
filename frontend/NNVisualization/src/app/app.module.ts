import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ManageComponent } from './manage/manage.component';
import { BuildComponent } from './build/build.component';
import { TrainComponent } from './train/train.component';
import { ImagesPanelComponent } from './visualize/images-panel/images-panel.component';
import { SelectedBarComponent } from './selected-bar/selected-bar.component';
import { SelectedArchitectureService } from './selected-architecture/selected-architecture.service';
import { VisualizeComponent } from './visualize/visualize.component';
import { NavAlgorithmsComponent } from './visualize/nav-algorithms/nav-algorithms.component';
import { VisArchComponent } from './vis-arch/vis-arch.component';

import { LayerComponent } from './vis-arch/layers/layer/layer.component';
import { FullyConnectedComponent } from './vis-arch/layers/fully-connected/fully-connected.component';
import { ConvComponent } from './vis-arch/layers/conv/conv.component';
import { InputComponent } from './vis-arch/layers/input/input.component';
import { PoolComponent } from './vis-arch/layers/pool/pool.component';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RestangularModule, Restangular } from 'ngx-restangular';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { InputImageComponent } from './visualize/images-panel/input-image/input-image.component';
import { OutputImageComponent } from './visualize/images-panel/output-image/output-image.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { LogInDialogComponent } from './header/log-in-dialog/log-in-dialog.component';
import { AuthenticationGuardService as AuthGuard } from './authentication/authentication-guard.service';
import { AuthenticationService, AuthenticationWithoutLoginService } from './authentication/authentication.service';
import { JwtModule, JwtHelperService as JwtHelper } from '@auth0/angular-jwt';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TimeoutAlertComponent } from './generic-dialogs/timeout-alert/timeout-alert.component';
import { GenericDialogsService } from './generic-dialogs/generic-dialogs.service';
import { InputsDialogComponent } from './generic-dialogs/inputs-dialog/inputs-dialog.component';

const appRoutes: Routes = [
    { path: '', redirectTo: 'manage', pathMatch: 'full' },
    { path: 'manage', component: ManageComponent, canActivate: [AuthGuard] },
    { path: 'build', component: BuildComponent, canActivate: [AuthGuard] },
    { path: 'train', component: TrainComponent, canActivate: [AuthGuard] },
    { path: 'visualize', component: VisualizeComponent, canActivate: [AuthGuard] },
    { path: 'visualize/:algorithm/:image_id', component: VisualizeComponent, canActivate: [AuthGuard] },
    { path: 'unauthorized', component: UnauthorizedComponent },
];

// Function for setting the default restangular configuration
export function RestangularConfigFactory(RestangularProvider, authService: AuthenticationWithoutLoginService) {
    RestangularProvider.setBaseUrl('/api');

    RestangularProvider.addFullRequestInterceptor((element, operation, path, url, headers, params) => {
        if (authService.isAuthenticated()) {
            const bearerToken = authService.getToken();

            return {
                headers: Object.assign({}, headers, { Authorization: `Bearer ${bearerToken}` })
            };
        }
        return {};
    });

    // HACK! :(
    // necessary so restangular's subscribe can work properly
    RestangularProvider.addResponseInterceptor((data, operation, what, url, response) => {
        switch (operation) {
            case 'post':
                return data;
            case 'put':
                return data;
            case 'remove':
                if (!data) { return {}; }
                return data;
            default:
                return data;
        }
    });
}


@NgModule({
    exports: [
        CdkTableModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
    ],
    declarations: []
})
export class MaterialImportsModule { }


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        NavbarComponent,
        ManageComponent,
        BuildComponent,
        TrainComponent,
        SelectedBarComponent,
        VisualizeComponent,
        VisArchComponent,
        LayerComponent,
        FullyConnectedComponent,
        ConvComponent,
        InputComponent,
        PoolComponent,
        ImagesPanelComponent,
        NavAlgorithmsComponent,
        InputImageComponent,
        OutputImageComponent,
        VisArchComponent,
        LogInDialogComponent,
        UnauthorizedComponent,
        TimeoutAlertComponent,
        InputsDialogComponent
    ],
    entryComponents: [
        LogInDialogComponent,
        TimeoutAlertComponent,
        InputsDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        RestangularModule.forRoot([AuthenticationWithoutLoginService], RestangularConfigFactory),
        MaterialImportsModule,
        NgxChartsModule,
        NgxGraphModule,
        NgxDnDModule,
        FlexLayoutModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: () => {
                    return localStorage.getItem('token');
                }
            }
        })
    ],
    providers: [SelectedArchitectureService, AuthenticationService,
        AuthenticationWithoutLoginService, AuthGuard, JwtHelper,
        GenericDialogsService],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
