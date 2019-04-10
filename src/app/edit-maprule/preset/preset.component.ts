import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation, AfterViewInit, ViewChildren, QueryList, SimpleChange, SimpleChanges } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray, Form } from '@angular/forms';

import { Field } from '../../shared/interfaces/field.interface';
// import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { FieldConfigService } from '../../core/services/field-config.service';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Event } from '@angular/router';
import { AccordionService } from '../../core/services/accordion.service';
import { MapRulesService } from 'src/app/core/services/maprules.service';
import { EditMapRuleComponent } from '../edit-maprule.component';

@Component({
  selector: 'app-preset',
  styleUrls: [
    './preset.component.css',
    '../../shared/components/content.group.css',
    '../form-table.css'
  ],
  templateUrl: './preset.html',
  encapsulation: ViewEncapsulation.None
})
export class PresetComponent {

  @ViewChildren("preset") presets: QueryList<any>

  // geometries: String[]
  constructor(
    private fb: FormBuilder,
    private editMapRule: EditMapRuleComponent,
    private fieldConfig: FieldConfigService,
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

  geometries(presetIndex: number): Array<any> {
    let geometries = this.editMapRule.presetGeometries[presetIndex];
    return this.fieldConfig.geom.map(function (g) {
      return {
        name: g,
        checked: geometries.includes(g)
      }
    })
  }

  updatePresetGeometries(event: any, presetIndex: number) {
    // if ()
    let presetGeoms = this.editMapRule.presetGeometries[presetIndex];
    let geometry = event.currentTarget.labels[0].innerText.trim();
    if (event.currentTarget.checked) {
      this.editMapRule.presetGeometries[presetIndex] = presetGeoms
        .concat(geometry).sort()
    } else {
      this.editMapRule.presetGeometries[presetIndex] = presetGeoms
        .filter(function (g) { return g !== geometry; })
        .sort();
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.presets.changes.subscribe((presets: QueryList<any>) => {
      if (!this.editMapRule.presets.value[presets.length - 1].presetName.length) {
        presets.last.nativeElement.classList.remove('preset-card-panel-hidden')
        presets.last.nativeElement.parentElement.querySelector('#show-preset-button i')
          .classList.replace('fa-plus-square-o', 'fa-minus-square-o')
        presets.last.nativeElement.parentElement.querySelector('.preset-card-header')
          .classList.remove('preset-card-panel-header-hidden')
      }
    })
  }

  private showPresetPanel(presetIndex: number): void {
    let preset = this.presets.toArray()[presetIndex];
    let hidden = preset.nativeElement.classList.contains('preset-card-panel-hidden');
    if (hidden) {
      preset.nativeElement.classList.remove('preset-card-panel-hidden')
      preset.nativeElement.parentElement.querySelector('#show-preset-button i')
        .classList.replace('fa-plus-square-o', 'fa-minus-square-o')
      this.presets.last.nativeElement.parentElement.querySelector('.preset-card-header')
        .classList.remove('preset-card-panel-header-hidden')
    } else {
      preset.nativeElement.classList.add('preset-card-panel-hidden')
      preset.nativeElement.parentElement.querySelector('#show-preset-button i')
        .classList.replace('fa-minus-square-o', 'fa-plus-square-o')
      this.presets.last.nativeElement.parentElement.querySelector('.preset-card-header')
        .classList.add('preset-card-panel-header-hidden')
    }
  }

  private addPreset(): void {
    this.editMapRule.createPresetFormGroup({
      primary: [ { key: '', val: '' } ],
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

  private removePreset(presetIndex: number): void {
    this.editMapRule.presets.removeAt(presetIndex);
    this.editMapRule.presetGeometries.splice(presetIndex, 1);
  }

  private removePrimaryGroup(presetIndex: number, primaryIndex: number): void {
    let primaryFormArray = this.primaryFormArray(presetIndex) as FormArray;
    if (primaryFormArray.length === 1) return;
    primaryFormArray.removeAt(primaryIndex)
  }

  private removeFeatureCard(presetIndex: number): void {
    this.editMapRule.presets.removeAt(presetIndex);
  }

  private removeField(presetIndex: number, fieldIndex: number): void {
    this.fieldsFormArray(presetIndex).removeAt(fieldIndex);
  }

  private selectGeom(event: any, presetIndex: number) {
    let geometryArray: FormArray = this.geometryArray(presetIndex) as FormArray;
    let geometry: string = event.target.labels[0].innerText.trim();
    if (event.target.checked) {
      geometryArray.push(this.fb.control(geometry))
    } else {
      let fb: FormBuilder = this.fb;
      let filteredGeometryArray = [];

      for (let i = geometryArray.controls.length - 1; i > -1; i--) {
        let formGeometry = geometryArray.at(i).value;
        if (formGeometry!== geometry) {
          filteredGeometryArray.push(formGeometry)
        }
        geometryArray.removeAt(i);
      }

      filteredGeometryArray.sort().forEach(function (geom) {
        geometryArray.push(fb.control(geom))
      })
    }
  }

}

