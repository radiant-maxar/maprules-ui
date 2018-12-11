import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';
import { SelectizeOption } from '../../interfaces/selectize-option.interface';

@Component({
  selector: 'guidelineSelectize',
  templateUrl: './guideline-selectize.component.html'
})
export class GuidelineSelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  nestedGroupIndex: number;
  nestedArrayIndex: number;
}
