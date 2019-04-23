import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMapruleComponent } from './view-maprule.component';

describe('ViewMapruleComponent', () => {
  let component: ViewMapruleComponent;
  let fixture: ComponentFixture<ViewMapruleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMapruleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMapruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
