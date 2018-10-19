import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValTooltipComponent } from './val-tooltip.component';

describe('ValTooltipComponent', () => {
  let component: ValTooltipComponent;
  let fixture: ComponentFixture<ValTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
