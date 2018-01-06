import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ManageComponent } from './manage/manage.component';
import { BuildComponent } from './build/build.component';
import { TrainComponent } from './train/train.component';
import { VisualizeComponent } from './visualize/visualize.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { RestangularModule, Restangular } from 'ngx-restangular';


const appRoutes: Routes = [
  { path: '', redirectTo: 'manage', pathMatch: 'full'},
  { path: 'manage', component: ManageComponent},
  { path: 'build', component: BuildComponent},
  { path: 'train', component: TrainComponent},
  { path: 'visualize', component: VisualizeComponent},
];

// Function for setting the default restangular configuration
export function RestangularConfigFactory (RestangularProvider) {
    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setDefaultHeaders({});
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavbarComponent,
    ManageComponent,
    BuildComponent,
    TrainComponent,
    VisualizeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
      RouterModule.forRoot(appRoutes),
      RestangularModule.forRoot(RestangularConfigFactory)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
