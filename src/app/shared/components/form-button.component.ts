import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'form-button',
  styleUrls: ['../../modules/attribution/feature/feature.component.css'],
  template: `
    <div [formGroup]="group">
      <button class="btn btn-light feature-button"
        [disabled]="config.disabled"
        type="submit">
        {{ config.label }}
      </button>
    </div>
  `
})
export class FormButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
