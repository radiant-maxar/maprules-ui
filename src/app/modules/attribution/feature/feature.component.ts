import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Field } from '../../../shared/interfaces/field.interface';
import { FieldConfig } from '../../../shared/interfaces/field-config.interface';
import { SelectizeOption } from '../../../shared/interfaces/selectize-option.interface';

import { AttributionComponent } from '../attribution.component';
import { FieldConfigService } from '../../../core/services/field-config.service';
import { TagInfoService } from '../../../core/services/tag-info.service';
declare var $: any;

@Component({
  exportAs: 'feature',
  selector: 'app-feature',
  styleUrls: ['../../../shared/components/content.group.css', './feature.component.css'],
  templateUrl: './feature.html'
})
export class FeatureComponent {
  @Input()
  config: FieldConfig[] = [];

  @Input()
  preset: {};

  @Input()
  i: number;

  constructor(
    private fb: FormBuilder,
    private attribution: AttributionComponent,
    private fieldConfig: FieldConfigService,
    private tagInfo: TagInfoService
  ) {}

  ngOnInit() {
    if (!this.attribution.loadedForm || !this.attribution.loadedForm.get('presets')[this.i]) {
      this.maximizeCard();
    }
    this.loadPrimaryGroups();
  }

  maximizeCard() {
    $(`#preset-card-panel-${this.i}`).css('max-height', 'initial');
    const toggler: any = $(`#preset-accordion-toggler-${this.i}`);
    toggler.addClass(`fa-minus-square-o`);
    toggler.removeClass(`fa-plus-square-o`);
  }

  loadPrimaryGroups() {
    const $scope = this;
    if (this.attribution.loadedForm && this.primaryFormArray.length === 0) {
      const keyOptions = [];
      const preset = this.attribution.loadedForm['presets'][this.i];
      if (preset && preset.primary) {
        let primaryKeyConfig;
        primaryKeyConfig = $scope.fieldConfig.getPrimaryKeyConfigSettings(keyOptions);
        this.fieldConfig.config.push(primaryKeyConfig); // TODO is this being used properly?
        preset.primary.forEach(function(loadedGroup) {
          keyOptions.push(<SelectizeOption>{text: loadedGroup['key'], value: loadedGroup['key']});
          $scope.addPrimaryKeyControl(primaryKeyConfig, loadedGroup);
        });
      }
    }

    if (this.primaryFormArray.length === 0) {
      this.addPrimaryGroup($scope.i, null);
    }
  }

  get featureFormGroup() {
    return <FormGroup> this.attribution.presets.at(this.i);
  }

  get primaryFormArray() {
    return <FormArray> this.featureFormGroup.get('primary');
  }

  get fields() {
    return <FormArray> this.featureFormGroup.get('fields');
  }

  addPrimaryGroup(i: number, loadedGroup: FormGroup) {
    const keyOptions = [];
    const primaryKeyConfig = this.fieldConfig.getPrimaryKeyConfigSettings(keyOptions);
    this.fieldConfig.config.push(primaryKeyConfig);
    this.addPrimaryKeyControl(primaryKeyConfig, loadedGroup);
  }
  
  addPrimaryKeyControl(primaryKeyConfig: FieldConfig, loadedGroup: FormGroup) {
    this.primaryFormArray.push(this.fb.group({}));

    const primaryGroupIndex = this.primaryFormArray.length === 0 ? 0 : this.primaryFormArray.length - 1;
    const primaryGroup = <FormGroup>this.primaryFormArray.at(primaryGroupIndex);
    primaryGroup.addControl('key', this.attribution.createControl(primaryKeyConfig));

    if (loadedGroup) {
      this.addPrimaryKeyListener(primaryGroup, primaryGroupIndex, loadedGroup);
      primaryGroup.get('key').setValue(loadedGroup['key']);
    } else {
      this.addPrimaryKeyListener(primaryGroup, primaryGroupIndex, null);
    }
  }

 addPrimaryKeyListener(primaryFormGroup: FormGroup, primaryGroupIndex: number, loadedGroup: FormGroup) {
    let loadedVal;
    if (loadedGroup) {
      loadedVal = loadedGroup['val'];
    }
    primaryFormGroup.get('key').valueChanges.subscribe(val => {
      setTimeout(() => {
        let valueOptions = [];
        if (loadedVal) {
          valueOptions.push(<SelectizeOption>{text: loadedVal, value: loadedVal});
        }

        const primaryValueConfig = this.fieldConfig.getPrimaryValueConfigSettings(valueOptions);
        this.setPrimaryValues(primaryGroupIndex, valueOptions, primaryValueConfig, loadedVal, primaryFormGroup);

        this.tagInfo.popularTags().subscribe(selectizeOptions => {
          valueOptions = valueOptions.concat(selectizeOptions);
          this.fieldConfig.refreshSelectizeOptions(this.i + '_' + primaryGroupIndex + '_val', valueOptions, !loadedVal);
        });

        if (!this.attribution.presets.at(this.i).get('name').value) {
          this.attribution.presets.at(this.i).get('name').patchValue(val);
        }
      });
    });
  }

  addPrimaryValueListener(primaryGroupIndex: number) {
    const primaryFormGroup = <FormGroup> this.primaryFormArray.at(primaryGroupIndex);
    primaryFormGroup.get('val').valueChanges.subscribe(val => {
      setTimeout(() => {
        if (val) {
          const key: string = primaryFormGroup.get('key').value;
          this.tagInfo.tagCombinations(key, val).subscribe();
          if (this.doNotPopulateTagCombos(this.attribution, this.i)) {
            const guidelines = this.attribution.loadedForm['presets'][this.i].fields;
            if (guidelines) {
              for (const guideline of guidelines) {
                this.addGuideline(this.i, guideline, key, val);
              }
            }
          }
        }
      });
    });
  }

  private doNotPopulateTagCombos(attribution: AttributionComponent, index: number): boolean {
    return attribution.loadedForm
      && (<FormArray> attribution.presets.at(index).get('fields')).length === 0
      && !attribution.loadedForm['presets'][index].fields;
  }

  removePrimaryGroup(primaryGroupIndex: number) {
    if (primaryGroupIndex !== 0) {
      this.primaryFormArray.removeAt(primaryGroupIndex);
    } else {
      alert('Specify at least one primary key for each entity.');
    }
  }

  addGuideline(i: number, loadedGuideline: FormGroup, key: string, val: string) {
    const $scope: FeatureComponent = this;

    (<FormArray> this.attribution.presets.at(i).get('fields')).push(this.fb.group({
      keyCondition: '',
      key: '',
      label: '',
      placeholder: '',
      values: this.fb.array([this.fb.group({valCondition: '', values: ''})])
    }));
    const guidelineGroupIndex = this.fields.length === 0 ? 0 : this.fields.length - 1;
    const guidelineGroup = <FormGroup>this.fields.at(guidelineGroupIndex);

    const keyOptions = [];

    if (loadedGuideline) {
      keyOptions.push(<SelectizeOption> {text: loadedGuideline['key'], value: loadedGuideline['key']});
    }
    const guidelineFields = this.fieldConfig.getGuidelineFieldConfig(this.i, guidelineGroupIndex, keyOptions);
    const guidelineMap = (this.fieldConfig.getFeatureGuidelineConfig(this.i) || new Map<number, FieldConfig[]>());

    guidelineMap.set(guidelineGroupIndex, guidelineFields);
    this.fieldConfig.guidelineConfig.set(this.i, guidelineMap);
    guidelineGroup.addControl('keyCondition', this.attribution.createControl(guidelineFields[0]));

    this.tagInfo.tagCombinations(key, val).subscribe(tagCombos => {
      const featureKeyOptions: SelectizeOption[] = Object.keys(tagCombos).map(tagInfoKey => {
        return <SelectizeOption>{ text: tagInfoKey, value: tagInfoKey };
      });
      $scope.fieldConfig.refreshSelectizeOptions(`${$scope.i}_associated_key_${guidelineGroupIndex}`, featureKeyOptions, false);
    });

    this.addKeyConditionListener(guidelineGroupIndex, loadedGuideline, key, val);
  }

  addKeyConditionListener(guidelineIndex: number, loadedGuideline: FormGroup, key: string, value: string) {
    const guidelineGroup = <FormGroup> this.fields.at(guidelineIndex);

    guidelineGroup.get('keyCondition').valueChanges.subscribe(keyConditionVal => {
      setTimeout(() => {

        guidelineGroup.addControl(
          'key',
          this.attribution.createControl(this.fieldConfig.getFeatureGuidelineField(this.i, guidelineIndex, 'key'))
        );

        (<FormGroup>(<FormArray>guidelineGroup.get('values')).at(0))
          .addControl(
            'valCondition',
            this.attribution.createControl(this.fieldConfig.getFeatureGuidelineField(this.i, guidelineIndex, 'valCondition'))
          );

        (<FormGroup>(<FormArray>guidelineGroup.get('values')).at(0))
          .addControl(
            'values',
            this.attribution.createControl(this.fieldConfig.getFeatureGuidelineField(this.i, guidelineIndex, 'values'))
          );

        guidelineGroup
          .addControl(
            'label',
            this.attribution.createControl(this.fieldConfig.getFeatureGuidelineField(this.i, guidelineIndex, 'label'))
          );

        guidelineGroup
          .addControl(
            'placeholder',
            this.attribution.createControl(this.fieldConfig.getFeatureGuidelineField(this.i, guidelineIndex, 'placeholder'))
          );

        const valConditionCtrl = (<FormArray> guidelineGroup.get('values')).at(0).get('valCondition');
        const $select = $(document.getElementById(this.i + '_associated_values_' + guidelineIndex));
        const placeholderCtrl = guidelineGroup.get('placeholder');

        if (keyConditionVal === 0) {
          valConditionCtrl.setValue('');
          valConditionCtrl.disable();

          if ($select[0]) {
            const selectize = $select[0].selectize;
            selectize.clear();
            selectize.disable();
          }

          placeholderCtrl.setValue('');
          placeholderCtrl.disable();
        } else {
          valConditionCtrl.enable();
          if ($select[0]) {
            const selectize = $select[0].selectize;
            selectize.enable();
          }
          placeholderCtrl.enable();
        }
      });
    });

    setTimeout(() => {
      if (loadedGuideline) {
        guidelineGroup.get('keyCondition').setValue(loadedGuideline['keyCondition']);
        if (loadedGuideline['values'].length > 0) {
          this.addAssociatedKeyListener(guidelineIndex, loadedGuideline['values'][0]['values'], key, value);
          (<FormArray>guidelineGroup.get('values')).at(0).get('valCondition').setValue(loadedGuideline['values'][0]['valCondition']);
        } else {
          this.addAssociatedKeyListener(guidelineIndex, null, key, value);
        }
        guidelineGroup.get('key').setValue(loadedGuideline['key'], {emitEvent: true});
        guidelineGroup.get('label').setValue(loadedGuideline['label']);
        guidelineGroup.get('placeholder').setValue(loadedGuideline['placeholder']);
      } else {
        this.addAssociatedKeyListener(guidelineIndex, null, key, value);
      }
    });
  }

  addAssociatedKeyListener(guidelineGroupIndex: number, loadedValues: string[], key: string, value: string) {
    const $scope: FeatureComponent = this;
    const guidelineFormGroup = <FormGroup> this.fields.at(guidelineGroupIndex);
    guidelineFormGroup.get('key').valueChanges.subscribe(val => {
      setTimeout(() => {
        this.tagInfo.tagCombinations(key, val).subscribe(comboMap => {
          const valueOptions = [];
          // add extant values && those then those from tagInfo
          for (const loadedVal of loadedValues) { valueOptions.push({ text: loadedVal, value: loadedVal }); }
          comboMap.get(key).forEach(comboVal => valueOptions.push({ text: comboVal, value: comboVal }));
          
          $scope.fieldConfig.getFeatureGuidelineField(this.i, guidelineGroupIndex, 'values').selectizeConfig.options = valueOptions;
          $scope.fieldConfig.refreshSelectizeOptions(this.i + '_associated_values_' + guidelineGroupIndex, valueOptions, true);

          if (loadedValues && (<FormGroup>guidelineFormGroup).get('key').pristine) {
            (<FormArray>guidelineFormGroup.get('values')).at(0).get('values').setValue(loadedValues);
          }
        })
      });
    });
  }

  removeField(i: number) {
    this.fields.removeAt(i);
  }

  setPrimaryValues(primaryGroupIndex: number, valueOptions: SelectizeOption[],
    primaryValueConfig: any, loadedVal: string, primaryFormGroup: FormGroup) {
    const featureConfig = this.fieldConfig.getFeaturePrimaryConfig(this.i);

    if (featureConfig) {
      const primaryGroupMap = featureConfig;
      primaryGroupMap.set(primaryGroupIndex, primaryValueConfig);
    } else {
      const primaryGroupMap = new Map<number, FieldConfig>();
      primaryGroupMap.set(primaryGroupIndex, primaryValueConfig);
      this.fieldConfig.primaryGroupConfig.set(this.i, primaryGroupMap);
    }
    this.fieldConfig.refreshSelectizeOptions(this.i + '_' + primaryGroupIndex + '_val', valueOptions, true);
    primaryFormGroup.addControl('val', this.attribution.createControl(primaryValueConfig));

    setTimeout(() => {
      this.addPrimaryValueListener(primaryGroupIndex);
      if (loadedVal && primaryFormGroup.get('val').pristine) {
        primaryFormGroup.get('val').setValue(loadedVal);
      }
    });
  }
}
