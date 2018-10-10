import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { Feature } from '../../shared/models/feature';
import { FeaturesComponent } from './features/features.component';
import { DiscouragedFeaturesComponent } from './discouraged-features/discouraged-features.component';
import { MapRulesService } from '../../core/services/maprules.service';
import { Router } from '@angular/router';

@Component({
  exportAs: 'attribution',
  selector: 'attribution',
  styleUrls: [
    '../../shared/components/content.group.css',
    './features/feature/feature.component.css'
    './attribution.component.css',
  ],
  templateUrl: './attribution.html'
})
export class AttributionComponent implements OnChanges, OnInit {
  @Input()
  configId: string;

  @Input()
  name: number;

  @Input()
  config: FieldConfig[] = [];

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  loadedForm: FormGroup;

  form: FormGroup;

  get controls() { return this.config.filter(({type}) => type !== 'button'); }
  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }
  get value() { return this.form.value; }
  get presets() { return this.form.get('presets') as FormArray; }
  get disabledFeatures() {
    return <FormArray> this.form.get('disabledFeatures') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private maprules: MapRulesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.createGroup();
    if (this.configId) {
      this.maprules.getMapRule(this.configId).subscribe(
        (data) => {
            this.form.get('name').setValue(data['name']);
            this.loadedForm = <FormGroup> data;
        },
        error => {
          console.error(error);
        }
      );
    } else if (this.name) {
      this.form.get('name').setValue(this.name);
    }
  }

  ngOnChanges() {
    if (this.form) {
      const controls = Object.keys(this.form.controls);
      const configControls = this.controls.map((item) => item.name);

      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => this.form.removeControl(control));

      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.config.find((control) => control.name === name);
          this.form.addControl(name, this.createControl(config));
        });
    }
  }

  createGroup() {
    const group = this.fb.group({
      name : ['', [Validators.required]],
      presets: this.fb.array([]),
      disabledFeatures: this.fb.array([])
    });
    this.controls.forEach(control => group.addControl(control.name, this.createControl(control)));
    return group;
  }

  createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.fb.control({ disabled, value }, validation);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.form.controls[name][method]();
      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  setValue(name: string, value: any): void {
    this.form.controls[name].setValue(value, {emitEvent: true});
  }

  saveForm(): void {
    this.maprules.saveForm(this.form.value)
      .subscribe(data => {
        this.router.navigateByUrl(`/${data['id']}/start`);
      });
  }

}
