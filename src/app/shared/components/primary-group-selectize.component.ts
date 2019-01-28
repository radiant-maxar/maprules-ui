import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'primary-selectize',
  template: `
    <ng-container [formGroup]="group">
      <ng-container formArrayName="presets">
        <ng-container [formGroupName]="nestedGroupIndex">
          <ng-container formArrayName="primary">
              <ng-container [formArrayName]="nestedArrayIndex">
                  <div class="form-group">
                    <legend>{{ config.label }}</legend>
                    <ng-selectize [id]="nestedGroupIndex + '_' + nestedArrayIndex + '_' + config.name" [formControlName]="config.name" [config]=config.selectizeConfig ngDefaultControl data-toggle="tooltip" data-placement="bottom" title="{{config.hint}}"></ng-selectize>       
                  </div>
              </ng-container>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
  `
})
export class PrimaryGroupSelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
}
