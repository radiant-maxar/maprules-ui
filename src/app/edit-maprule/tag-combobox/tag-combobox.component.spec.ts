import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagComboboxComponent } from './tag-combobox.component';

describe('TagComboboxComponent', () => {
  let component: TagComboboxComponent;
  let fixture: ComponentFixture<TagComboboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagComboboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
