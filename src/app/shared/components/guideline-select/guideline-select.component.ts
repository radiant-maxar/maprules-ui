import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';

@Component({
  selector: 'guidelineSelect',
  template: 'guideline-select.component.html'
})
export class GuidelineSelectComponent implements Field {
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
