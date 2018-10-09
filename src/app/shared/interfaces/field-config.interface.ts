import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
  disabled?: boolean,
  id?: string,
  label?: string,
  name: string,
  options?: string[],
  optionMap?: Map<string, any>,
  selectizeConfig?: any,
  hint?: string,
  placeholder?: string,
  type: string,
  validation?: ValidatorFn[],
  value?: any
}
