import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { FieldConfig } from '../shared/interfaces/field-config.interface';
import { Feature } from '../shared/models/feature';
import { PresetComponent } from './preset/preset.component';
import { DisabledFeatureComponent} from './disabled-feature/disabled-feature.component'
import { MapRulesService } from '../core/services/maprules.service';
import { NavigationService } from '../core/services/navigation.service'; 
import { Router, ActivatedRoute } from '@angular/router';
import { FieldConfigService } from 'src/app/core/services/field-config.service';

@Component({
  exportAs: 'edit-maprule',
  selector: 'app-edit-maprule',
  styleUrls: [
    '../shared/components/content.group.css',
    './edit-maprule.component.css'
  ],
  templateUrl: './edit-maprule.html'
})
export class EditMapRuleComponent implements OnInit {
  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  get presets() { return this.form.get('presets') as FormArray; }
  get disabledFeatures() {
    return this.form.get('disabledFeatures') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private maprules: MapRulesService,
    private nav: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    private fieldConfig: FieldConfigService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(
      (next) => {
        this.createMapRuleFormGroup();
        if (next.hasOwnProperty('id')) {
          this.maprules.getMapRule(next.id).subscribe(
            (data: any) => {
              this.form.get('mapruleName').setValue(data.name);
              data.presets.forEach(this.createPresetFormGroup.bind(this));
              data.disabledFeatures.forEach(this.createDisabledFormGroup.bind(this));
            },
            (error) => {
              console.error(error);
            }
          );
        } else {
          this.form.get('mapruleName').setValue('');
        }  
      }
    )
  }

  // ngOnChanges() {
  //   if (this.form) {
  //     const controls = Object.keys(this.form.controls);
  //     const configControls = this.controls.map((item) => item.name);

  //     controls
  //       .filter((control) => !configControls.includes(control))
  //       .forEach((control) => this.form.removeControl(control));

  //     configControls
  //       .filter((control) => !controls.includes(control))
  //       .forEach((name) => {
  //         const config = this.config.find((control) => control.name === name);
  //         this.form.addControl(name, this.createControl(config));
  //       });
  //   }
  // }

  /**
   * Creates Form Group for preset.
   * @param preset {any} Preset in maprules config presets array
   */
  createPresetFormGroup(preset: any) {
    let fb: FormBuilder = this.fb, fieldConfig = this.fieldConfig;
    let presets: FormArray = this.form.get('presets') as FormArray;

    // primary key controls
    let primaries: FormArray = this.fb.array([]);
    preset.primary.forEach(function(primary) {
      primaries.push(fb.group({
        primaryKey: fb.control(primary.key, Validators.required),
        primaryVal: fb.control(primary.val, Validators.required)
      }))
    })

    if (primaries.length === 0) primaries.push(fb.group({  }))

    let fields: FormArray = this.fb.array([]);
    preset.fields.forEach(function(field) {
      let keyCondition: String = fieldConfig.keyCondition(field.keyCondition);
      let valCondition: String = fieldConfig.valCondition(field.valCondition)
        
      fields.push(fb.group({
        fieldKeyCondition: fb.control(keyCondition, Validators.required),
        fieldKey: fb.control(field.key, Validators.required),
        fieldValCondition: fb.control(valCondition),
        fieldVal: fb.control('')
      }))
    })

    let geometries = fb.array([]);
    preset.geometry.forEach(function(geometry) {
      geometries.push(fb.control(geometry))
    })

    presets.push(fb.group({
      primary: primaries,
      presetName: fb.control(preset.name),
      geometry: geometries,
      fields: fields
    }));
  }

  createDisabledFormGroup(disabledFeature: any) {
    let disabledFeatures: FormArray = <FormArray> this.form.get('disabledFeatures');

    disabledFeatures.push(this.fb.group({
      disabledKey: this.fb.control(disabledFeature.key),
      disabledVal: this.fb.control('')
    }));
  }

  createMapRuleFormGroup() {
    this.form = this.fb.group({
      mapruleName : ['', [Validators.required]],
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
   // this.submit.emit(this.value);
  }

  // setDisabled(name: string, disable: boolean) {
  //   if (this.form.get(name)) {
  //     const method = disable ? 'disable' : 'enable';
  //     this.form.get(name)[method]();
  //     return;
  //   }

  //   this.config = this.config.map((item) => {
  //     if (item.name === name) {
  //       item.disabled = disable;
  //     }
  //     return item;
  //   });
  // }

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
