import { EditMapRuleComponent } from 'src/app/modules/attribution/edit-maprule.component';
import { ViewMapRuleComponent } from 'src/app/modules/attribution/view-maprule.component';
import { StartMapRuleComponent } from 'src/app/modules/attribution/start-maprule.component';
import { MainComponent } from 'src/app/modules/main/main.component';
import { Routes } from '@angular/router';
import { AttributionModule } from 'src/app/modules/attribution/attribution.module';
import { WayComponent } from 'src/app/icons/way/way.component';
import { AreaComponent } from 'src/app/icons/area/area.component'
import { NodeComponent } from 'src/app/icons/node/node.component';
import { TagsComponent } from 'src/app/shared/components/tags/tags.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EncodeClassPipe } from 'src/app/encode-class.pipe';
import { DecodeConditionPipe } from 'src/app/decode-condition.pipe';
import { ValTooltipComponent } from 'src/app/shared/components/val-tooltip/val-tooltip.component';
import { APP_BASE_HREF } from '@angular/common';

export const appModules: any[] = [
  AttributionModule,
  NgbModule
]

export const appComponents: any[] = [
  MainComponent,
  EditMapRuleComponent,
  ViewMapRuleComponent,
  StartMapRuleComponent,
  WayComponent,
  AreaComponent,
  NodeComponent,
  TagsComponent,
  EncodeClassPipe,
  DecodeConditionPipe,
  ValTooltipComponent
]

export const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MainComponent },
  { path: 'new', component: EditMapRuleComponent },
  { path: ':id/instructions', component: ViewMapRuleComponent },
  { path: ':id/start', component: StartMapRuleComponent },
  { path: ':id/edit', component: EditMapRuleComponent },
];

export const appProviders: any[] = [
  {provide: APP_BASE_HREF, useValue: '/'}
]