import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../interfaces/field.interface';
import { FieldConfig } from '../../interfaces/field-config.interface';

@Component({
  selector: 'entity-selectize',
  templateUrl: './entity-selectize.html'
})
export class EntitySelectizeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
