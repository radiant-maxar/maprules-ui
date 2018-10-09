import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';
import { SelectizeOption } from '../interfaces/selectize-option.interface';

@Component({
  selector: 'valueSelectize',
  template: `
    <ng-container [formGroup]="group">
      <ng-container formArrayName="presets">
        <ng-container [formGroupName]="nestedGroupIndex">
          <ng-container formArrayName="fields">
              <ng-container [formArrayName]="nestedArrayIndex">
                  <ng-container formArrayName="values">
                    <ng-container formArrayName="0">
                          <div class="form-group">
                            <legend>{{ config.label }}</legend>
                            <span class="form-text text-muted">
                              {{ config.hint }}
                            </span>
                            <ng-selectize [id]="config.id" [formControlName]="config.name" [config]=config.selectizeConfig ngDefaultControl></ng-selectize>
                              <div class="alert alert-danger" *ngIf="group.get('presets').at(nestedGroupIndex).get('fields').at(nestedArrayIndex).get(config.name).invalid && (group.get('presets').at(nestedGroupIndex).get('fields').at(nestedArrayIndex).get(config.name).dirty || group.get('presets').at(nestedGroupIndex).get('fields').at(nestedArrayIndex).touched)">
                                <div *ngIf="group.get('presets').at(nestedGroupIndex).get('fields').at(nestedArrayIndex).get(config.name).errors.required">
                                  Required.
                                </div>
                              </div>
                          </div>
                    </ng-container>
                  </ng-container>
              </ng-container>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
  `
})
export class ValueSelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
}
