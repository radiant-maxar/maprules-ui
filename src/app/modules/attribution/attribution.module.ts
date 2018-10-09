import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectizeModule } from 'ng-selectize';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 

import { AttributionDirective } from '../../shared/directives/attribution.directive';
import { PrimaryIdentifierDirective } from '../../shared/directives/primary-identifier.directive';
import { FeatureDirective } from '../../shared/directives/feature.directive';
import { DiscouragedFeatureDirective } from '../../shared/directives/discouraged-feature.directive';
import { GuidelineDirective } from '../../shared/directives/guideline.directive';

import { AttributionComponent } from './attribution.component';
import { FeaturesComponent } from './features/features.component';
import { FeatureComponent } from './features/feature/feature.component';
import { DiscouragedFeaturesComponent } from './discouraged-features/discouraged-features.component';

import { EntitiesComponent } from '../../shared/components/entities.component';
import { DiscouragedEntitiesComponent } from '../../shared/components/discouraged-entities.component';
import { DiscouragedSelectizeComponent } from '../../shared/components/discouraged-selectize.component';
import { PrimaryGroupSelectizeComponent } from '../../shared/components/primary-group-selectize.component';
import { GuidelineSelectComponent } from '../../shared/components/guideline-select.component';
import { GuidelineSelectizeComponent } from '../../shared/components/guideline-selectize.component';
import { ValueSelectComponent } from '../../shared/components/value-select.component';
import { ValueSelectizeComponent } from '../../shared/components/value-selectize.component';
import { GuidelineInputComponent } from '../../shared/components/guideline-input.component';
import { FormInputComponent } from '../../shared/components/form-input.component';
import { FormButtonComponent } from '../../shared/components/form-button.component';
import { EntityInputComponent } from '../../shared/components/entity-input.component';
import { EntitySelectizeComponent } from '../../shared/components/entity-selectize.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectizeModule,
    NgbModule
  ],
  declarations: [
    AttributionDirective,
    FeatureDirective,
    DiscouragedFeatureDirective,
    PrimaryIdentifierDirective,
    GuidelineDirective,
    AttributionComponent,
    FeaturesComponent,
    FeatureComponent,
    DiscouragedFeaturesComponent,
    DiscouragedSelectizeComponent,
    PrimaryGroupSelectizeComponent,
    GuidelineSelectComponent,
    GuidelineSelectizeComponent,
    ValueSelectComponent,
    ValueSelectizeComponent,
    GuidelineInputComponent,
    FormInputComponent,
    EntityInputComponent,
    EntitySelectizeComponent,
    EntitiesComponent,
    DiscouragedEntitiesComponent,
    FormButtonComponent
  ],
  exports: [
    AttributionComponent,
    FeaturesComponent,
    FeatureComponent,
    DiscouragedFeaturesComponent
  ],
  entryComponents: [
    PrimaryGroupSelectizeComponent,
    GuidelineSelectComponent,
    GuidelineSelectizeComponent,
    ValueSelectComponent,
    ValueSelectizeComponent,
    GuidelineInputComponent,
    EntitiesComponent,
    DiscouragedEntitiesComponent,
    DiscouragedSelectizeComponent,
    FormInputComponent,
    FormButtonComponent,
    EntityInputComponent,
    EntitySelectizeComponent
  ]
})
export class AttributionModule {}
