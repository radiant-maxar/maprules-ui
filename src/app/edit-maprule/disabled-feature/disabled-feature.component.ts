import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { EditMapRuleComponent } from '../edit-maprule.component';


declare var $: any;

@Component({
  exportAs: 'disabled-feature',
  selector: 'app-disabled-feature',
  styleUrls: [ './disabled-feature.component.css' ],
  templateUrl: './disabled-feature.html'
})
export class DisabledFeatureComponent {

  constructor(
    private fb: FormBuilder,
    private editMapRule: EditMapRuleComponent
  ) {}

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

}
