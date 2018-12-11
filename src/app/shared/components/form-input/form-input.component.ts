import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';

@Component({
  selector: 'form-input',
  styleUrls: [
    '../content.group.css',
    './form-input.component.css',
    '../entity-input.component.css'
  ],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
