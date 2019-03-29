import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { Feature } from '../../shared/models/feature';
import { FeaturesComponent } from './features/features.component';
import { DiscouragedFeaturesComponent } from './discouraged-features/discouraged-features.component';
import { MapRulesService } from '../../core/services/maprules.service';
import { NavigationService } from '../../core/services/navigation.service'; 
import { Router } from '@angular/router';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { preserveWhitespacesDefault } from '@angular/compiler';

@Component({
  exportAs: 'attribution',
  selector: 'attribution',
  styleUrls: [
    '../../shared/components/content.group.css',
    './features/feature/feature.component.css',
    './features/features.component.css',
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
    private nav: NavigationService,
    private router: Router,
    private fieldConfig: FieldConfigService
  ) {}

  ngOnInit() {
    let that = this;
    this.createMapRuleFormGroup();
    if (this.configId) { // if existing config, get it, then build FromGroup...
      this.maprules.getMapRule(this.configId).subscribe(
        function(data: any) {
          that.form.get('name').setValue(data.name);
          data.presets.forEach(that.createPresetFormGroup.bind(that));
          data.disabledFeatures.forEach(that.createDisabledFormGroup.bind(that));
        },
        function(error) {
          console.error(error);
        }
      );
    } else if (this.name) { // otherwise, leave blank...
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

  /**
   * Creates Form Group for preset.
   * @param preset {any} Preset in maprules config presets array
   */
  createPresetFormGroup(preset: any) {
    let fb: FormBuilder = this.fb, fieldConfig = this.fieldConfig;
    let presets: FormArray = <FormArray> this.form.get('presets');

    // primary key controls
    let primaries: FormArray = preset.primary.map(function(primary) {
      return fb.group({
        key: fb.control(primary.key, Validators.required),
        value:fb.control(primary.value, Validators.required)
      })
    })

    let fields: FormArray = preset.fields.map(function(field) {
      let keyCondition: String = fieldConfig.keyCondition(field.keyCondition);
      let valCondition: String = fieldConfig.valCondition(field.valCondition)
        
      return fb.group({
        keyCondition: fb.control(keyCondition, Validators.required),
        key: fb.control(field.key, Validators.required),
        valCondition: fb.control(valCondition),
        val: fb.control('')
      })
    })

    presets.push(fb.group({
      primary: primaries,
      name: preset.name,
      geometry: [preset.geometry],
      fields: fields
    }));
  }

  createDisabledFormGroup(disabledFeature: any) {
    let disabledFeatures: FormArray = <FormArray> this.form.get('disabledFeatures');

    disabledFeatures.push(this.fb.group({
      key: this.fb.control(disabledFeature.key),
      val: this.fb.control('')
    }));
  }

  createMapRuleFormGroup() {
    this.form = this.fb.group({
      name : ['', [Validators.required]],
      presets: this.fb.array([]),
      disabledFeatures: this.fb.array([])
    });
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
    if (this.form.get(name)) {
      const method = disable ? 'disable' : 'enable';
      this.form.get(name)[method]();
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
    this.form.get("name").setValue(value, {emitEvent: true});
  }

  saveForm(): void {
    this.maprules.saveForm(this.form.value)
      .subscribe(data => {
        this.router.navigateByUrl(`/${data['id']}/start`);
      });
  }

}
