import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { LinkComponent } from 'src/app/shared/components/link/link.component';
import {
  appComponents,
  appRoutes,
  appModules,
  appProviders
} from '../../../helpers';

describe('LinkComponent', () => {
  let component: LinkComponent;
  let fixture: ComponentFixture<LinkComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkComponent ].concat(appComponents),
      imports: [ RouterModule.forRoot(appRoutes) ].concat(appModules),
      providers: appProviders
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});