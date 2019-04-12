import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { EditMapRuleComponent } from '../edit-maprule.component';
import { FieldConfigService } from 'src/app/core/services/field-config.service';

@Component({
  exportAs: 'disabled-feature',
  selector: 'app-disabled-feature',
  styleUrls: [
    '../form-table.css',
    '../preset/preset.component.css',
    '../../shared/components/content.group.css',
    './disabled-feature.component.css'
  ],
  templateUrl: './disabled-feature.html'
})
export class DisabledFeatureComponent {

  constructor(
    private fb: FormBuilder,
    private fieldConfig: FieldConfigService,
    private editMapRule: EditMapRuleComponent
  ) {}

  @ViewChild("disabledFeature") disabledFeature: ElementRef;
  _showComponent: boolean = true;

  ngOnInit() { }

  ngAfterViewInit() {
    this.fieldConfig.emitter.subscribe(
      (next) => {
        if (next.type && next.type === 'maprule-init') {
          if (this.disabledFeaturesFormArray().length) {
            this.showDisabledFeaturePanel();
          }
        }
      }
    )
  }

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
    if (
      this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
      .classList.contains('preset-card-panel-hidden')
    ) {
      this.showDisabledFeaturePanel();
    }
  }

  showDisabledFeaturePanel(): void {
    if (!this.disabledFeaturesFormArray().length) {
      return;
    }

    let hidden = this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
      .classList.contains('preset-card-panel-hidden');
    if (hidden) {
      this.disabledFeature.nativeElement.querySelector('.disabled-feature-header')
        .classList.remove('disabled-feature-card-panel-header-hidden')
      this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
        .classList.remove('preset-card-panel-hidden')
      this.disabledFeature.nativeElement.querySelector('#show-preset-button i')
        .classList.replace('fa-plus-square-o', 'fa-minus-square-o');
    } else {
      this.disabledFeature.nativeElement.querySelector('.preset-card-panel')
        .classList.add('preset-card-panel-hidden')
      this.disabledFeature.nativeElement.querySelector('.disabled-feature-header')
        .classList.add('disabled-feature-card-panel-header-hidden')
      this.disabledFeature.nativeElement.querySelector('#show-preset-button i')
        .classList.replace('fa-minus-square-o', 'fa-plus-square-o')
    }
  }

}
