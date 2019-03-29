import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Field } from '../../../shared/interfaces/field.interface';
import { FieldConfig } from '../../../shared/interfaces/field-config.interface';
import { SelectizeOption } from '../../../shared/interfaces/selectize-option.interface';
import { AttributionComponent } from '../attribution.component';
import { FieldConfigService } from '../../../core/services/field-config.service';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'; 
import { Event } from '@angular/router';
import { AccordionService } from '../../../core/services/accordion.service';
import { MapRulesService } from 'src/app/core/services/maprules.service';

declare var $: any;

@Component({
  selector: 'app-features',
  styleUrls: [
    '../../../shared/components/content.group.css',
    './features.component.css',
    './feature/feature.component.css'
  ],
  templateUrl: './features.html',
  encapsulation: ViewEncapsulation.None
})
export class FeaturesComponent {
  @Input()
  config: FieldConfig[] = [];
  geoms: String[] = [ 'Point', 'Line', 'Polygon' ]

  constructor(
    private fb: FormBuilder,
    private attribution: AttributionComponent,
    private fieldConfig: FieldConfigService,
    private accordion: AccordionService,
    private maprules: MapRulesService
  ) {}

  ngOnInit() {
    let that = this;
    this.maprules.events.on('new-config', function(config) {
      config.presets.forEach(function(preset) {
        // make form group for preset
        let presetFormGroup: FormGroup = that.fb.group({
          primary: that.fb.array([]),
          name: preset.name,
          geometry: preset.geometry
          // fields: that.fb.array([])
        })
        that.attribution.presets.push(presetFormGroup);
      })
    })
  }



  // private addFeatureCard(): void {
  //   const featureConfig = [
  //                         {
  //                           type: 'input',
  //                           name: 'name',
  //                           placeholder: 'Preset ' + control.value.length,
  //                         },
  //                         {
  //                           type: 'selectize',
  //                           name: 'geometry',
  //                           hint: 'Select preset geometry',
  //                           selectizeConfig: {
  //                             persist: false,
  //                             maxItems: null,
  //                             plugins: ['dropdown_direction', 'remove_button'],
  //                             dropdownDirection: 'down',
  //                             options: [
  //                               <SelectizeOption>{text: 'Point', value: 'Point'},
  //                               <SelectizeOption>{text: 'Line', value: 'Line'},
  //                               <SelectizeOption>{text: 'Area', value: 'Area'}
  //                             ]
  //                           }
  //                         }
  //                       ];
  //   const featureIndex = control.value.length - 1;
  //   this.fieldConfig.featureConfig[featureIndex] = featureConfig;
  // }

  // private clearFeatureCards(): void {
  //   const control = this.attribution.presets;
  //   while (control.length !== 0) {
  //     control.removeAt(0);
  //   }
  // }

  // private getFeature(): FormGroup {
  //   return this.fb.group({  primary: this.fb.array([]),
  //                           name: '',
  //                           geometry: [['Point', 'Line', 'Area']],
  //                           fields: this.fb.array([])
  //                       });
  // }

  // private removeFeatureCard(i: number): void {
  //   const control = this.attribution.presets;
  //   control.removeAt(i);
  // }

  // private panelClass(i: number): string {
  //   const presetCard: any = $(`#preset-card-panel-${i}`);
  //   const height: number = presetCard.length ? Number(presetCard.css('height').replace('px', '')) : 0;
  //   return `col-md-12 preset-card-panel${height > 1 ? '': ' card-closed'}`
  // }

  // private animateAccordion(e: any, index: number) {
  //   this.accordion.animate(e, "preset-card-panel", index);
  // }
}

