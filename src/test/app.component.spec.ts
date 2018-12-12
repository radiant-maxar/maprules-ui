import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { EditMapRuleComponent } from 'src/app/modules/attribution/edit-maprule.component';
import { ViewMapRuleComponent } from 'src/app/modules/attribution/view-maprule.component';
import { StartMapRuleComponent } from 'src/app/modules/attribution/start-maprule.component';
import { MainComponent } from 'src/app/modules/main/main.component';
import { NavigationBarComponent } from 'src/app/shared/components/navigation-bar/navigation-bar.component';
import { RouterModule, Routes } from '@angular/router';
import { AttributionModule } from 'src/app/modules/attribution/attribution.module';
import { AreaComponent } from 'src/app/icons/area/area.component';
import { NodeComponent } from 'src/app/icons/node/node.component';
import { LinkComponent } from 'src/app/shared/components/link/link.component';
import { WayComponent } from 'src/app/icons/way/way.component';
import { TagsComponent } from 'src/app/shared/components/tags/tags.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { EncodeClassPipe } from 'src/app/encode-class.pipe';
import { DecodeConditionPipe } from 'src/app/decode-condition.pipe';
import { ValTooltipComponent } from 'src/app/shared/components/val-tooltip/val-tooltip.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectizeModule } from 'ng-selectize';
import { APP_BASE_HREF } from '@angular/common';
import { appRoutes } from './helpers';

describe('AppComponent', () => {

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
