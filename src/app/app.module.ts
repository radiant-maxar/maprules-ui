import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AttributionModule } from './modules/attribution/attribution.module';
import { EditMapRuleComponent } from './modules/attribution/edit-maprule.component';
import { ViewMapRuleComponent } from './modules/attribution/view-maprule.component';
import { StartMapRuleComponent } from './modules/attribution/start-maprule.component';
import { MainComponent } from './modules/main/main.component';
import { NgSelectizeModule } from 'ng-selectize';
import { AppComponent } from './app.component';
import { NodeComponent } from './icons/node/node.component';
import { WayComponent } from './icons/way/way.component';
import { AreaComponent } from './icons/area/area.component';
import { LinkComponent } from './shared/components/link/link.component';
const appRoutes: Routes = [
  { path: 'maprule/', redirectTo: '/home', pathMatch: 'full' },
  { path: 'maprule/home', component: MainComponent },
  { path: 'maprule/new', component: EditMapRuleComponent },
  { path: 'maprule/:id/instructions', component: ViewMapRuleComponent },
  { path: 'maprule:id/start', component: StartMapRuleComponent },
  { path: 'maprule/:id/edit', component: EditMapRuleComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    EditMapRuleComponent,
    ViewMapRuleComponent,
    StartMapRuleComponent,
    MainComponent,
    NodeComponent,
    WayComponent,
    AreaComponent,
    LinkComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AttributionModule,
    NgbModule,
    NgSelectizeModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
