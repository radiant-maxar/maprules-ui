import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EditMapRuleModule } from './modules/EditMapRuleModule';
import { NavigationBarComponent } from './shared/components/navigation-bar.component';
import { EditMapRuleComponent } from './edit-maprule/edit-maprule.component';
import { ViewMapRuleComponent } from './modules/attribution/view-maprule.component';
import { StartMapRuleComponent } from './modules/attribution/start-maprule.component';
import { MainComponent } from './modules/main/main.component';
import { NgSelectizeModule } from 'ng-selectize';
import { AppComponent } from './app.component';
import { NodeComponent } from './icons/node/node.component';
import { WayComponent } from './icons/way/way.component';
import { AreaComponent } from './icons/area/area.component';
import { LinkComponent } from './shared/components/link/link.component';
import { TagsComponent } from './shared/components/tags/tags.component';
import { ValTooltipComponent } from './shared/components/val-tooltip/val-tooltip.component';
import { DecodeConditionPipe } from './decode-condition.pipe';
import { EncodeClassPipe } from './encode-class.pipe';

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
    MainComponent,
    NodeComponent,
    WayComponent,
    AreaComponent,
    LinkComponent,
    TagsComponent,
    ValTooltipComponent,
    DecodeConditionPipe,
    EncodeClassPipe,
  ],
  imports: [
    BrowserModule,
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
