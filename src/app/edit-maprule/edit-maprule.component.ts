import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { FieldConfig } from '../shared/interfaces/field-config.interface';
import { PresetComponent } from './preset/preset.component';
import { DisabledFeatureComponent} from './disabled-feature/disabled-feature.component'
import { MapRulesService } from '../core/services/maprules.service';
import { NavigationService } from '../core/services/navigation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { TagInfoService } from '../core/services/tag-info.service';
import { fbind } from 'q';

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
    private tagInfoSevice: TagInfoService,
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
              this.tagInfoSevice.popularKeys().subscribe();
              this.form.get('mapruleName').setValue(data.name);
              data.presets.forEach(this.createPresetFormGroup.bind(this));
              data.disabledFeatures.forEach(this.createDisabledFormGroup.bind(this));
              this.fieldConfig.emitter.emit({ type: 'maprule-init' });
            },
            (error) => {
              console.error(error);
            }
          );
        } else {
          this.form.get('mapruleName').setValue('');
          this.createPresetFormGroup({
            primary: [{ key: '', val: '' }],
            name: '',
            geometry: this.fieldConfig.geometry,
            fields: []
          });
          this.fieldConfig.emitter.emit({ type: 'maprule-init' });
        }
      }
    )
  }

  /**
   * Creates Form Group for preset.
   * @param preset {any} Preset in maprules config presets array
   */
  createPresetFormGroup(preset: any) {
    let fb: FormBuilder = this.fb;
    let presets: FormArray = this.form.get('presets') as FormArray;

    // primary key controls
    let primaries: FormArray = this.fb.array([]);
    preset.primary.forEach(function(primary) {
      primaries.push(fb.group({
        primaryKey: fb.control(primary.key),
        primaryVal: fb.control(primary.val)
      }))
    })

    if (primaries.length === 0) primaries.push(fb.group({ }))

    let fields: FormArray = this.fb.array([]);
    preset.fields.forEach(function(field) {
      let keyCondition: String = FieldConfigService.keyCondition(field.keyCondition);
      let valCondition: String = FieldConfigService.valCondition(field.values[0].valCondition)

      fields.push(fb.group({
        fieldKeyCondition: fb.control(keyCondition, Validators.required),
        fieldKey: fb.control(field.key, Validators.required),
        fieldValCondition: fb.control(valCondition),
        fieldVal: fb.control(field.values.length ? field.values[0].values.join(',') : '')
      }))
    })

    let geometries = fb.array([]);
    preset.geometry.forEach(function(geometry: string) {
      geometries.push(fb.control(geometry[0].toUpperCase() + geometry.slice(1))) // force title case
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
      disabledVal: this.fb.control(disabledFeature.val.join(','))
    }));
  }

  createMapRuleFormGroup() {
    this.form = this.fb.group({
      mapruleName : ['', [Validators.required]],
      presets: this.fb.array([]),
      disabledFeatures: this.fb.array([])
    });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  saveForm(): void {
    this.maprules.saveForm(this.form.value)
      .subscribe(data => {
        this.router.navigateByUrl(`/${data['id']}/start`);
      });
  }

}
