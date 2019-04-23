import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartMapruleComponent } from './start-maprule.component';

describe('StartMapruleComponent', () => {
  let component: StartMapruleComponent;
  let fixture: ComponentFixture<StartMapruleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartMapruleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartMapruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
