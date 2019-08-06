import { Component, EventEmitter, Input, OnChanges, OnInit, Output, HostListener } from '@angular/core';
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
import { Subject } from 'rxjs';
import { debounce, debounceTime, filter } from 'rxjs/operators';

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
  private clicks: Subject<any> = new Subject();

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  presetGeometries = [];

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
          let presets = this.form.get('presets') as FormArray;
          (presets.at(0).get('fields') as FormArray).push(this.fb.group({
            fieldKeyCondition: this.fb.control('', Validators.required),
            fieldKey: this.fb.control('', Validators.required),
            fieldValCondition: this.fb.control(''),
            fieldVal: this.fb.control('')
          }))
          this.fieldConfig.emitter.emit({ type: 'maprule-init' });
        }
      }
    )
    this.clickHandler();
  }

  getNav(): NavigationService { return this.nav; }

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
	  let valCode = field.values.length ? field.values[0].valCondition: '';
      let keyCondition: String = FieldConfigService.keyCondition(field.keyCondition);
      let valCondition: String = FieldConfigService.valCondition(valCode)

      fields.push(fb.group({
        fieldKeyCondition: fb.control(keyCondition, Validators.required),
        fieldKey: fb.control(field.key, Validators.required),
        fieldValCondition: fb.control(valCondition),
        fieldVal: fb.control(field.values.length ? field.values[0].values.join(',') : '')
      }))
    })

    this.presetGeometries.push(preset.geometry)

    presets.push(fb.group({
      primary: primaries,
      presetName: fb.control(preset.name),
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
    this.maprules.save(this.form.value, this.presetGeometries)
      .subscribe((resp: any) => {
        if (resp.error) {
            if (resp.error.status === 401) {
                location.replace('/login.html');
            } else {
                window.alert(resp.message)
            }
        } else {
            let configId = resp.id || this.route.snapshot.params.id; // data.id when from new, params.id when fromm existing...
            this.router.navigateByUrl(`/${configId}/start`);
        }
      });
  }

  /**
   * When documnet clicked, send to click handler...
   */
  @HostListener('document:click', ['$event.target.className'])
  public onClick(targetElement) {
    this.clicks.next(targetElement)
  }

  /**
   * used to close dropdowns when clicks happen outside combobox of combobox drop downs.
   */
  clickHandler() {
    this.clicks
      .pipe(
        debounceTime(100),
        filter(className => ! /combo/.test(className)), // ignore clicks to combobox elements!
      )
      .subscribe(() => this.fieldConfig.emitter.emit({ type: 'clicked' }))
  }

}
