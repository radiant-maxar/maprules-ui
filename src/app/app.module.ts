import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EditMapRuleModule } from './modules/edit-maprule.module';
import { NavigationBarComponent } from './shared/components/navigation-bar/navigation-bar.component';
import { EditMapRuleComponent } from './edit-maprule/edit-maprule.component';
import { ViewMapRuleComponent } from './view-maprule/view-maprule.component';
import { MainComponent } from './main/main.component';
import { NgSelectizeModule } from 'ng-selectize';
import { AppComponent } from './app.component';
import { NodeComponent } from './icons/node/node.component';
import { WayComponent } from './icons/way/way.component';
import { AreaComponent } from './icons/area/area.component';
import { LinkComponent } from './shared/components/link/link.component';
import { DecodeConditionPipe } from './decode-condition.pipe';
import { EncodeClassPipe } from './encode-class.pipe';
import { ComboboxModule } from './modules/combobox.module';
import { ViewPresetComponent } from './view-maprule/view-preset/view-preset.component';
import { ViewDisabledFeatureComponent } from './view-maprule/view-disabled-feature/view-disabled-feature.component';
import { StartMapRuleComponent } from './start-maprule/start-maprule.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MainComponent },
  { path: 'new', component: EditMapRuleComponent },
  { path: ':id/instructions', component: ViewMapRuleComponent },
  { path: ':id/start', component: StartMapRuleComponent },
  { path: ':id/edit', component: EditMapRuleComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationBarComponent,
    EditMapRuleComponent,
    ViewMapRuleComponent,
    StartMapRuleComponent,
    ViewPresetComponent,
    MainComponent,
    NodeComponent,
    WayComponent,
    AreaComponent,
    LinkComponent,
    DecodeConditionPipe,
    EncodeClassPipe,
    ViewDisabledFeatureComponent
  ],
  imports: [
    BrowserModule,
    ComboboxModule,
    ReactiveFormsModule,
    EditMapRuleModule,
    NgbModule,
    NgSelectizeModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
