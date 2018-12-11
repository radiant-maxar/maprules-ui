import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';

@Component({
  selector: 'guidelineInput',
  templateUrl: './guideline-input.component.html'
})
export class GuidelineInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
}
