import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'form-input',
  styleUrls: [
    './content.group.css',
    './form-input.component.css',
    './entity-input.component.css'
  ],
  template: `
      <div class="content-group" [formGroup]="group">
        <div class='content-header'>
          <label class="content-label">
            <h5>{{ config.label }}</h5>
          </label>
        </div>
        <div class='content-body'>
          <input
            [formControlName]="config.name"
            class="maprule-name form-input form-control entity-input"
            data-toggle="tooltip" data-placement="bottom" title="{{config.hint}}"/>
        </div>
      </div>
  `
})
export class FormInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
