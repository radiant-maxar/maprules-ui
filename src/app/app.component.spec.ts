import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { EditMapRuleComponent } from './modules/attribution/edit-maprule.component';
import { ViewMapRuleComponent } from './modules/attribution/view-maprule.component';
import { StartMapRuleComponent } from './modules/attribution/start-maprule.component';
import { MainComponent } from './modules/main/main.component';
import { NavigationBarComponent } from './shared/components/navigation-bar/navigation-bar.component';
import { RouterModule, Routes } from '@angular/router';
import { AttributionModule } from './modules/attribution/attribution.module';
import { AreaComponent } from './icons/area/area.component';
import { NodeComponent } from './icons/node/node.component';
import { LinkComponent } from './shared/components/link/link.component';
import { WayComponent } from './icons/way/way.component';
import { TagsComponent } from './shared/components/tags/tags.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { EncodeClassPipe } from './encode-class.pipe';
import { DecodeConditionPipe } from './decode-condition.pipe';
import { ValTooltipComponent } from './shared/components/val-tooltip/val-tooltip.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectizeModule } from 'ng-selectize';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', () => {

  const appRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainComponent },
    { path: 'new', component: EditMapRuleComponent },
    { path: ':id/instructions', component: ViewMapRuleComponent },
    { path: ':id/start', component: StartMapRuleComponent },
    { path: ':id/edit', component: EditMapRuleComponent },
  ];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
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
        NavigationBarComponent,
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
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'}
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
