import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Field } from '../../../shared/interfaces/field.interface';
import { FieldConfig } from '../../../shared/interfaces/field-config.interface';
import { SelectizeOption } from '../../../shared/interfaces/selectize-option.interface';
import { AttributionComponent } from '../attribution.component';
import { FieldConfigService } from '../../../core/services/field-config.service';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'; 
import { Event } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private attribution: AttributionComponent,
    private fieldConfig: FieldConfigService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      const $scope = this;
      let presetIndex = 0;
      if (this.attribution.loadedForm && this.attribution.loadedForm['presets']){
        this.attribution.loadedForm['presets'].forEach(function(preset){
          $scope.addFeatureCard();
          const presetControls = (<FormGroup>(<FormGroup>(<FormArray>$scope.attribution.form.get("presets")).at(presetIndex))); 
          presetControls.get("name").setValue(preset.name);
          presetControls.get("geometry").setValue(preset.geometry);
          presetIndex++;
        });
      }
    });
  }

  private addFeatureCard(): void {
    const control = this.attribution.presets;
    control.push(this.getFeature());
    const featureConfig = [
                          {
                            type: 'input',
                            name: 'name',
                            placeholder: 'Preset ' + control.value.length,
                          },
                          {
                            type: 'selectize',
                            name: 'geometry',
                            hint: 'Select preset geometry',
                            selectizeConfig: {
                              persist: false,
                              maxItems: null,
                              plugins: ['dropdown_direction', 'remove_button'],
                              dropdownDirection: 'down',
                              options: [
                                <SelectizeOption>{text: 'Point', value: 'Point'},
                                <SelectizeOption>{text: 'Line', value: 'Line'},
                                <SelectizeOption>{text: 'Area', value: 'Area'}
                              ]
                            }
                          }
                        ];
    const featureIndex = control.value.length - 1;
    this.fieldConfig.featureConfig.set(featureIndex, featureConfig);
  }

  private clearFeatureCards(): void {
    const control = this.attribution.presets;
    while (control.length !== 0) {
      control.removeAt(0);
    }
  }

  private getFeature(): FormGroup {
    return this.fb.group({  primary: this.fb.array([]),
                            name: '',
                            geometry: [['Point', 'Line', 'Area']],
                            fields: this.fb.array([])
                        });
  }

  private removeFeatureCard(i: number): void {
    const control = this.attribution.presets;
    control.removeAt(i);
  }

  private animateAccordion(e: any, index: number) {
    e.preventDefault();
    const presetCard: any = $(`#preset-card-panel-${index}`);
    if (presetCard.length) {
      const height: number = Number($(presetCard).css('height').replace('px', ''));

      let newClass = '';
      let oldClass = '';

      if (height > 1) {
        oldClass = 'minus';
        newClass = 'plus';
      } else {
        oldClass = 'plus';
        newClass = 'minus';
      }

      const toggler: any = $(`#preset-accordion-toggler-${index}`);
      toggler.addClass(`fa-${newClass}-square-o`);
      toggler.removeClass(`fa-${oldClass}-square-o`);

      $(presetCard).css('max-height', height > 1 ? 0 : 'initial');

    }
  }
}

