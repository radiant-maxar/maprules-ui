import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'entity-selectize',
  template: `
      <ng-container [formGroup]="group">
        <ng-container formArrayName="presets">
          <ng-container [formGroupName]="nestedGroupIndex">
            <div class="form-group">
              <label>{{ config.label }}</label>
              <ng-selectize [formControlName]="config.name" [config]=config.selectizeConfig ngDefaultControl data-toggle="tooltip" data-placement="bottom" title="{{config.hint}}"></ng-selectize>
            </div>
          </ng-container>
        </ng-container>
      </ng-container>
  `
})
export class EntitySelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
