import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectizeModule } from 'ng-selectize';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PresetComponent } from '../edit-maprule/preset/preset.component';
import { DisabledFeatureComponent } from '../edit-maprule/disabled-feature/disabled-feature.component';
import { ComboboxModule } from './combobox.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectizeModule,
    NgbModule,
    ComboboxModule
  ],
  declarations: [
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
