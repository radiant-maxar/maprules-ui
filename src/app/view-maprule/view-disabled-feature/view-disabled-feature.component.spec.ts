import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDisabledFeatureComponent } from './view-disabled-feature.component';

describe('ViewDisabledFeatureComponent', () => {
  let component: ViewDisabledFeatureComponent;
  let fixture: ComponentFixture<ViewDisabledFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDisabledFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDisabledFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
