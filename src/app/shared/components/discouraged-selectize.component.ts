import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'discouraged-selectize',
  template: `
    <ng-container [formGroup]="group">
      <ng-container formArrayName="disabledFeatures">
        <ng-container [formGroupName]="nestedGroupIndex">
          <div class="form-group">
            <legend>{{ config.label }}</legend>
            <span class="form-text text-muted">
              {{ config.hint }}
            </span>
            <ng-selectize [formControlName]="config.name" [config]=config.selectizeConfig ngDefaultControl></ng-selectize>       
          </div>

        </ng-container>
      </ng-container>
    </ng-container>
  `
})
export class DiscouragedSelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
}
