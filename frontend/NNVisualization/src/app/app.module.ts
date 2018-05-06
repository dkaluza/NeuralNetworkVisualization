import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

import { MaterialImportsModule } from './material-imports.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ManageComponent } from './manage/manage.component';
import { TrainParamsService } from './train/train-params.serivce';
import { TrainModule, TrainComponent } from './train/train.module';
import { ImagesPanelComponent } from './visualize/images-panel/images-panel.component';
import { SelectedBarComponent } from './selected-bar/selected-bar.component';
import { SelectedArchitectureService } from './selected-architecture/selected-architecture.service';
import { VisualizeComponent } from './visualize/visualize.component';

import { BuildComponent, BuildModule } from './build/build.module';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RestangularModule } from 'ngx-restangular';
import { LogInDialogComponent } from './header/log-in-dialog/log-in-dialog.component';
import { AuthenticationGuardService as AuthGuard } from './authentication/authentication-guard.service';
import { AuthenticationService, AuthenticationWithoutLoginService } from './authentication/authentication.service';
import { JwtHelperService as JwtHelper, JwtModule } from '@auth0/angular-jwt';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TimeoutAlertComponent } from './generic-dialogs/timeout-alert/timeout-alert.component';
import { GenericDialogsService } from './generic-dialogs/generic-dialogs.service';
import { InputsDialogComponent } from './generic-dialogs/inputs-dialog/inputs-dialog.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { IOSocketService } from './iosocket/iosocket.service';

const appRoutes: Routes = [
    { path: '', redirectTo: 'manage', pathMatch: 'full' },
    { path: 'manage', component: ManageComponent, canActivate: [AuthGuard] },
    { path: 'build', component: BuildComponent, canActivate: [AuthGuard] },
    { path: 'datasets', component: DatasetsComponent, canActivate: [AuthGuard] },
    { path: 'train', component: TrainComponent, canActivate: [AuthGuard] },
    { path: 'visualize', component: VisualizeComponent, canActivate: [AuthGuard] },
    { path: 'visualize/:algorithm/:image_id', component: VisualizeComponent, canActivate: [AuthGuard] },
    { path: 'unauthorized', component: UnauthorizedComponent },
];

// Function for setting the default restangular configuration
export function RestangularConfigFactory(RestangularProvider,
    authService: AuthenticationWithoutLoginService,
    genericDialogs: GenericDialogsService) {
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
                if (!data) {
                    return {};
                }
                return data;
            default:
                return data;
        }
    });

    function _b64toBlob(base64Data, contentType) {
        contentType = contentType || '';
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    RestangularProvider.addResponseInterceptor((data, operation, what, url, response) => {
        if ('base64' in data) {
            if (data['base64'] instanceof Array) {
                for (const field of data['base64']) {
                    const fieldName = field['name'];
                    const contentType = field['contentType'];
                    data[fieldName] = _b64toBlob(data[fieldName], contentType);
                }
            }
        }
        return data;
    });

    RestangularProvider.addErrorInterceptor((response, subject, responseHandler) => {
        if (response.status === 504) {
            genericDialogs.createWarning('Data or authorization server is not responding.\n \
                Please contact the administrator or try again later.', 'Error');
            return false;
        }

        return true;
    });
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        NavbarComponent,
        ManageComponent,
        SelectedBarComponent,
        VisualizeComponent,
        ImagesPanelComponent,
        LogInDialogComponent,
        UnauthorizedComponent,
        TimeoutAlertComponent,
        InputsDialogComponent,
        DatasetsComponent
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
        RestangularModule.forRoot([AuthenticationWithoutLoginService,
            GenericDialogsService], RestangularConfigFactory),
        MaterialImportsModule,
        FlexLayoutModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: () => {
                    return localStorage.getItem('token');
                }
            }
        }),
        BuildModule,
        TrainModule,
        NgSelectModule
    ],
    providers: [
        SelectedArchitectureService,
        AuthenticationService,
        AuthenticationWithoutLoginService,
        AuthGuard,
        JwtHelper,
        GenericDialogsService,
        TrainParamsService,
        IOSocketService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule);
