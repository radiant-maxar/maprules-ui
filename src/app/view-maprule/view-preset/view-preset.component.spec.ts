import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPresetComponent } from './view-preset.component';

describe('ViewPresetComponent', () => {
  let component: ViewPresetComponent;
  let fixture: ComponentFixture<ViewPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
