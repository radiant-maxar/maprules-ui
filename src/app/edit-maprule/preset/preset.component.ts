import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray, Form } from '@angular/forms';

import { Field } from '../../shared/interfaces/field.interface';
// import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { FieldConfigService } from '../../core/services/field-config.service';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Event } from '@angular/router';
import { AccordionService } from '../../core/services/accordion.service';
import { MapRulesService } from 'src/app/core/services/maprules.service';
import { EditMapRuleComponent } from '../edit-maprule.component';
import { fbind } from 'q';

declare var $: any;

@Component({
  selector: 'app-preset',
  styleUrls: [
    './preset.component.css',
    '../../shared/components/content.group.css'
  ],
  templateUrl: './preset.html',
  encapsulation: ViewEncapsulation.None
})
export class PresetComponent {
  // @Input()
  // config: FieldConfig[] = [];

  geometries: String[]

  constructor(
    private fb: FormBuilder,
    private editMapRule: EditMapRuleComponent,
    private fieldConfig: FieldConfigService,
    private accordion: AccordionService,
    private maprules: MapRulesService
  ) { }

  /* GETTERS FOR NESTED PARTS OF PRESET GROUP */
  primaryFormArray(presetIndex: number): FormArray {
    return this.editMapRule.presets.at(presetIndex).get('primary') as FormArray;
  }

  geometryArray(presetIndex: number): FormArray {
    return this.editMapRule.presets.at(presetIndex).get('geometry') as FormArray;
  }

  fieldsFormArray(presetIndex: number): FormArray {
    return this.editMapRule.presets.at(presetIndex).get('fields') as FormArray;
  }

  ngOnInit() {}

  private addPreset(): void {
    this.editMapRule.createPresetFormGroup({
      primary: [],
      name: '',
      geometry: this.fieldConfig.geometry,
      fields: []
    });
  }

  private addPrimaryGroup(presetIndex: number): void {
    let primaryGroups = this.editMapRule.presets.at(presetIndex).get('primary') as FormArray;
    primaryGroups.push(this.fb.group({
      primaryKey: this.fb.control('', Validators.required),
      primaryVal: this.fb.control('', Validators.required)
    }))
  }
  
  private addField(presetIndex: number): void {
    let fields = this.editMapRule.presets.at(presetIndex).get('fields') as FormArray;
    fields.push(this.fb.group({
      fieldKeyCondition: this.fb.control('', Validators.required),
      fieldKey: this.fb.control('', Validators.required),
      fieldValCondition: this.fb.control(''),
      fieldVal: this.fb.control('')
    }))
  }

  private removePrimaryGroup(presetIndex: number, primaryIndex: number): void {
    if (this.editMapRule.presets.length === 1) return;
    this.primaryFormArray(presetIndex).removeAt(primaryIndex)
  }

  private removeFeatureCard(presetIndex: number): void {
    this.editMapRule.presets.removeAt(presetIndex);
  }

  private removeField(presetIndex: number, fieldIndex: number): void {
    this.fieldsFormArray(presetIndex).removeAt(fieldIndex);
  }
}

