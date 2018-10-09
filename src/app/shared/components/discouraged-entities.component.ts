import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'discouraged-entities',
  template: `
	<discouraged-features [config]="config"></discouraged-features>
  `
})
export class DiscouragedEntitiesComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
