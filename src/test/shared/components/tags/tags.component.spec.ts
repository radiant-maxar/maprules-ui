import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsComponent } from 'src/app/shared/components/tags/tags.component';
import {
  appModules,
  appComponents,
  appProviders
} from 'src/test/helpers';



describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: appModules,
      declarations: [ TagsComponent ].concat(appComponents),
      providers: appProviders
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
