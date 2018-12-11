import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'valueSelect',
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
                      <select [formControlName]="config.name" class="form-control">
                        <option value=""></option>
                        <option [ngValue]="config.optionMap.get(option)" *ngFor="let option of options">
                          {{ option }}
                        </option>
                      </select>
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
export class ValueSelectComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
  options: string[];

  ngOnInit() {
    setTimeout(() => {
      if (this.config.optionMap) {
        this.options = Array.from(this.config.optionMap.keys());
      }
    });
  }
}
