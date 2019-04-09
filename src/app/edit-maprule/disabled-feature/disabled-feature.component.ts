import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { EditMapRuleComponent } from '../edit-maprule.component';

@Component({
  exportAs: 'disabled-feature',
  selector: 'app-disabled-feature',
  styleUrls: [
    './disabled-feature.component.css',
    '../form-table.css',
    '../preset/preset.component.css',
    '../../shared/components/content.group.css'
  ],
  templateUrl: './disabled-feature.html'
})
export class DisabledFeatureComponent {

  constructor(
    private fb: FormBuilder,
    private editMapRule: EditMapRuleComponent
  ) {}

  @ViewChild("disabledFeature") disabledFeature: ElementRef;
  _showComponent: boolean = true;

  ngOnInit() {}

  disabledFeaturesFormArray(): FormArray {
    return this.editMapRule.disabledFeatures as FormArray;
  }

  removeDisabledFeature(disabledFeatureIndex: number): void {
    this.disabledFeaturesFormArray().removeAt(disabledFeatureIndex);
  }

  addDisabledFeature(): void {
    this.disabledFeaturesFormArray().push(this.fb.group({
      disabledKey: this.fb.control(''),
      disabledVal: this.fb.control('')
    }))
  }

  showDisabledFeaturePanel(): void {
    let open = this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
      .classList.contains('preset-card-panel-hidden');
    if (open) {
      this.disabledFeature.nativeElement.querySelector('.disabled-feature-header')
        .classList.remove('preset-card-panel-header-hidden')
      this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
        .classList.remove('preset-card-panel-hidden')
      this.disabledFeature.nativeElement.querySelector('#show-preset-button i')
        .classList.replace('fa-minus-square-o', 'fa-plus-square-o');
    } else {
      this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
        .classList.add('preset-card-panel-hidden')
      this.disabledFeature.nativeElement.querySelector('.disabled-feature-header')
        .classList.add('preset-card-panel-header-hidden')
      this.disabledFeature.nativeElement.querySelector('#show-preset-button i')
        .classList.replace('fa-plus-square-o', 'fa-minus-square-o')
    }
  }

}
