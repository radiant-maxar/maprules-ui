import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';
import { SelectizeOption } from '../../interfaces/selectize-option.interface';

@Component({
  selector: 'valueSelectize',
  template: './value-selectize.component.html'
})
export class ValueSelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
}
