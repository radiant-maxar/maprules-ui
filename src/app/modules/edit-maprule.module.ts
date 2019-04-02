import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectizeModule } from 'ng-selectize';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 

import { AttributionDirective } from '../shared/directives/attribution.directive';
import { PrimaryIdentifierDirective } from '../shared/directives/primary-identifier.directive';
import { FeatureDirective } from '../shared/directives/feature.directive';
import { DiscouragedFeatureDirective } from '../shared/directives/discouraged-feature.directive';
import { GuidelineDirective } from '../shared/directives/guideline.directive';

import { PresetComponent } from '../edit-maprule/preset/preset.component';
import { DisabledFeatureComponent } from '../edit-maprule/disabled-feature/disabled-feature.component';
import { ComboboxModule } from './combobox.module';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectizeModule,
    NgbModule,
    ComboboxModule
  ],
  declarations: [
    AttributionDirective,
    FeatureDirective,
    DiscouragedFeatureDirective,
    PrimaryIdentifierDirective,
    GuidelineDirective,
    PresetComponent,
    DisabledFeatureComponent
  ],
  exports: [
    PresetComponent,
    DisabledFeatureComponent,
  ],
  entryComponents: []
})
export class EditMapRuleModule {}
