import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';

@Component({
  selector: 'entities',
  styleUrls: ['./entities.component.css', './content.group.css'],
  template: ``
	// <app-features [config]="config"></app-features>
  // `
})
export class EntitiesComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
