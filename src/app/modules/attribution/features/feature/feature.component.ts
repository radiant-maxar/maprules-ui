import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Field } from '../../../../shared/interfaces/field.interface';
import { FieldConfig } from '../../../../shared/interfaces/field-config.interface';
import { SelectizeOption } from '../../../../shared/interfaces/selectize-option.interface';

import { AttributionComponent } from '../../attribution.component';
import { FieldConfigService } from '../../../../core/services/field-config.service';
import { TagInfoService } from '../../../../core/services/tag-info.service';
declare var $: any;

@Component({
  exportAs: 'feature',
  selector: 'app-feature',
  styleUrls: ['../../../../shared/components/content.group.css', './feature.component.css'],
  templateUrl: './feature.html'
})
export class FeatureComponent {
  @Input()
  config: FieldConfig[] = [];

  @Input()
  preset: {};
  
  @Input()
  i: number;


  ngOnInit(){
    setTimeout(() => {
      this.tagInfo.popularTagsRequest.add(() => {
        var $scope = this;
        var presetControls = (<FormArray>$scope.attribution.form.get('presets')).at(this.i);
        var primaryGroupIndex = 0;
        if(this.attribution.loadedForm && this.primaryFormArray.length == 0){
          var preset = this.attribution.loadedForm['presets'][this.i];
          if(preset && preset.primary){
            preset.primary.forEach(function(loadedGroup){
              $scope.addPrimaryGroup($scope.i, loadedGroup);
            });
          }
        }
        if(this.primaryFormArray.length == 0){
          this.addPrimaryGroup(0, null);
        }
      });
    });
  }

  get featureFormGroup(){
    return <FormGroup> this.attribution.presets.at(this.i);    
  }
  
  get primaryFormArray(){
    return <FormArray> this.featureFormGroup.get('primary');
  }

  get fields(){
    return <FormArray> this.featureFormGroup.get('fields');
  }

  constructor(private fb: FormBuilder, private attribution: AttributionComponent, private fieldConfig: FieldConfigService, private tagInfo: TagInfoService) {}
  addPrimaryGroup(i: number, loadedGroup: FormGroup){
    var keyOptions = this.tagInfo.popularKeys;
    if(loadedGroup){
      keyOptions.push(<SelectizeOption>{text: loadedGroup['key'], value: loadedGroup['key']});
    }
    const featureFormGroup = <FormGroup> this.attribution.presets.at(i);
    var primaryKeyConfig = {  type: 'primary',
                              name: 'key',
                              validation: [Validators.required],
                              selectizeConfig: {
                                                create: true,
                                                persist: true,
                                                items: [""],
                                                maxItems: 1,
                                                options: keyOptions,
                                                plugins: ['dropdown_direction'],
                                                dropdownDirection: 'down' 
                              }
                           };

    this.fieldConfig.config.push(primaryKeyConfig); 

    this.primaryFormArray.push(this.fb.group({}));

    const primaryGroupIndex = this.primaryFormArray.length == 0 ? 0 : this.primaryFormArray.length - 1;
    const primaryGroup = <FormGroup>this.primaryFormArray.at(primaryGroupIndex);
    primaryGroup.addControl("key", this.attribution.createControl(primaryKeyConfig));

    if(loadedGroup){
      var val = loadedGroup['val'];
      this.addPrimaryKeyListener(primaryGroupIndex, val);
      primaryGroup.get('key').setValue(loadedGroup['key']);
    } else {
      this.addPrimaryKeyListener(primaryGroupIndex, null);
    }
  }

 addPrimaryKeyListener(primaryGroupIndex: number, loadedVal: string){
    let primaryFormGroup = <FormGroup> this.primaryFormArray.at(primaryGroupIndex); 
    primaryFormGroup.get('key').valueChanges.subscribe(val => { 
      setTimeout(() => { 
        var valueOptions = [<SelectizeOption>{text:"", value:""}];
        var popularValuesRequest = this.tagInfo.getPopularValues(val).subscribe(
          (data) => {
            var values = data['data'];      
            values.sort((a,b) => parseFloat(b.count) - parseFloat(a.count)).forEach(function(prop) {
              var current = <SelectizeOption>{text:prop.value, value:prop.value};
              valueOptions.push(current);
            });
          }, 
          error => {
            console.error(error);
          }
        );

        if(loadedVal) {
          valueOptions.push(<SelectizeOption>{text: loadedVal, value: loadedVal});
        }

        popularValuesRequest.add(() => {
          setTimeout(() => {
            var primaryValueConfig = {
                                          type: 'primary',
                                          name: 'val',
                                          value: "",
                                          selectizeConfig: {
                                                              create: true,
                                                              persist: true,
                                                              maxItems: 1,
                                                              items: [""],
                                                              options: valueOptions,
                                                              allowEmptyOption: true,
                                                              plugins: ['dropdown_direction'],
                                                              dropdownDirection: 'down'
                                                            }
                                     };

            let featureConfig = this.fieldConfig.getFeaturePrimaryConfig(this.i);
            if(featureConfig) {
              let primaryGroupMap = featureConfig;
              let $select = $(document.getElementById(this.i + "_" + primaryGroupIndex + "_val"));
              if($select[0]){
                let selectize = $select[0].selectize;
                selectize.clear();
                selectize.clearOptions();
                selectize.load(function(callback) {
                    callback(valueOptions);
                });
              }
              primaryGroupMap.set(primaryGroupIndex, primaryValueConfig);
            } else {
              const primaryGroupMap = new Map<number, FieldConfig>();
              primaryGroupMap.set(primaryGroupIndex, primaryValueConfig);
              this.fieldConfig.primaryGroupConfig.set(this.i, primaryGroupMap);
            }
            primaryFormGroup.addControl('val', this.attribution.createControl(primaryValueConfig));
            setTimeout(() => {
              this.addPrimaryValueListener(primaryGroupIndex);
              if(loadedVal && primaryFormGroup.get('val').pristine) {
                primaryFormGroup.get('val').setValue(loadedVal);
              }
            });
          });
        });
        if(!this.attribution.presets.at(this.i).get("name").value) {
          this.attribution.presets.at(this.i).get("name").patchValue(val);
        }
      });
    });
  }

  addPrimaryValueListener(primaryGroupIndex: number) {
    let primaryFormGroup = <FormGroup> this.primaryFormArray.at(primaryGroupIndex);
    let featureComboMap = this.tagInfo.comboMap.get(this.i);
    let primaryValListener = primaryFormGroup.get('val').valueChanges.subscribe(val => {
      setTimeout(() => {
        if(!featureComboMap) {
          featureComboMap = [];
        }
        const tagComboRequest = this.tagInfo.getTagCombinations(primaryFormGroup.get('key').value, val).subscribe((data) => {
          const combos = data['data'].sort((a, b) => parseFloat(b.together_count) - parseFloat(a.together_count));
          combos.forEach(function(combo) {
            if (featureComboMap[combo.other_key]) {
              featureComboMap[combo.other_key].push(combo.other_value);
            } else {
              featureComboMap[combo.other_key] = [combo.other_value];
            }
          });
          this.tagInfo.comboMap.set(this.i, featureComboMap);
        });

        tagComboRequest.add(() => {
          let featureKeyOptions = this.tagInfo.keysMap.get(this.i);
          if (!featureKeyOptions) {
            featureKeyOptions = [];
          }
          Object.keys(featureComboMap).forEach(function(key) {
            featureKeyOptions.push(<SelectizeOption>{ text: key, value: key});
          });
          this.tagInfo.keysMap.set(this.i, featureKeyOptions);
          if (this.attribution.loadedForm && (<FormArray> this.attribution.presets.at(this.i).get('fields')).length === 0) {
            if (!this.attribution.loadedForm['presets'][this.i]) {
              return;
            }
            const guidelines = this.attribution.loadedForm['presets'][this.i].fields;
            const $scope = this;
            if (guidelines) {
              guidelines.forEach(function(guideline) {
                $scope.addGuideline($scope.i, guideline);
              });
            }
          }
        });
      });
    });
  }

  removePrimaryGroup(primaryGroupIndex: number) {
    if (primaryGroupIndex !== 0) {
      this.primaryFormArray.removeAt(primaryGroupIndex);
    } else {
      alert('Specify at least one primary key for each entity.');
    }
  }

  addGuideline(i: number, loadedGuideline: FormGroup) {
    (<FormArray> this.attribution.presets.at(i).get('fields')).push(this.fb.group({
      keyCondition: '',
      key: '',
      label: '',
      placeholder: '',
      values: this.fb.array([this.fb.group({valCondition: '', values: ''})])
    }));
    const guidelineGroupIndex = this.fields.length === 0 ? 0 : this.fields.length - 1;
    const guidelineGroup = <FormGroup>this.fields.at(guidelineGroupIndex);
    const keyOptions = this.tagInfo.keysMap.get(this.i);
    if (loadedGuideline) {
      keyOptions.push(<SelectizeOption> {text: loadedGuideline['key'], value: loadedGuideline['key']});
    }
    const guidelineFields = [ {
                              type: 'guideline',
                              name: 'keyCondition',
                              optionMap: this.fieldConfig.keyConditionMap,
                              validation: [Validators.required] // TODO make validation work for these fields
                            },
                            {
                              type: 'guidelineSelectize',
                              name: 'key',
                              id: this.i + '_associated_key_' + guidelineGroupIndex,
                              validation: [Validators.required],
                              selectizeConfig: {
                                                create: true,
                                                persist: true,
                                                maxItems: 1,
                                                options: keyOptions,
                                                plugins: ['dropdown_direction'],
                                                dropdownDirection: 'down'
                                              }
                            },
                            {
                              type: 'valueSelect',
                              name: 'valCondition',
                              optionMap: this.fieldConfig.valConditionMap
                             },
                            {
                              type: 'valueSelectize',
                              name: 'values',
                              id: this.i + '_associated_values_' + guidelineGroupIndex,
                              selectizeConfig: {
                                                  create: true,
                                                  persist: true,
                                                  plugins: ['dropdown_direction', 'remove_button'],
                                                  dropdownDirection: 'down',
                                                  maxItems: null
                                                }
                            },
                            {
                              type: 'guidelineInput',
                              name: 'label'
                            },
                            {
                              type: 'guidelineInput',
                              name: 'placeholder'
                            }
                           ];
    const guidelineConfig = this.fieldConfig.getFeatureGuidelineConfig(this.i);
    let guidelineMap;
    if (guidelineConfig) {
      guidelineMap = guidelineConfig;
      guidelineMap.set(guidelineGroupIndex, guidelineFields);
    } else {
      guidelineMap = new Map<number, FieldConfig[]>();
      guidelineMap.set(guidelineGroupIndex, guidelineFields);
      this.fieldConfig.guidelineConfig.set(this.i, guidelineMap);
    }
    guidelineGroup.addControl('keyCondition', this.attribution.createControl(guidelineFields[0]));
    this.addKeyConditionListener(guidelineGroupIndex, loadedGuideline);
  }

  addKeyConditionListener(guidelineIndex: number, loadedGuideline: FormGroup) {
    const guidelineGroup = <FormGroup> this.fields.at(guidelineIndex);

    guidelineGroup.get('keyCondition').valueChanges.subscribe(val => {
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
        const valuesCtrl = (<FormArray> guidelineGroup.get('values')).at(0).get('values');
        const $select = $(document.getElementById(this.i + '_associated_values_' + guidelineIndex));
        const placeholderCtrl = guidelineGroup.get('placeholder');

        if (val === 0) {
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
          this.addAssociatedKeyListener(guidelineIndex, loadedGuideline['values'][0]['values']);
          (<FormArray>guidelineGroup.get('values')).at(0).get('valCondition').setValue(loadedGuideline['values'][0]['valCondition']);
        } else {
          this.addAssociatedKeyListener(guidelineIndex, null);
        }
        guidelineGroup.get('key').setValue(loadedGuideline['key'], {emitEvent: true});
        guidelineGroup.get('label').setValue(loadedGuideline['label']);
        guidelineGroup.get('placeholder').setValue(loadedGuideline['placeholder']);
      } else {
        this.addAssociatedKeyListener(guidelineIndex, null);
      }
    });
  }

  addAssociatedKeyListener(guidelineGroupIndex: number, loadedValues: string[]) {
    const guidelineFormGroup = <FormGroup> this.fields.at(guidelineGroupIndex);
    guidelineFormGroup.get('key').valueChanges.subscribe(val => {
      setTimeout(() => {
        const valueOptions = [];
        if (this.tagInfo.comboMap.get(this.i) && this.tagInfo.comboMap.get(this.i)[val]) {
          this.tagInfo.comboMap.get(this.i)[val].forEach(function(value) {
            valueOptions.push({ text: value, value: value});
           });
        }
        if (loadedValues) {
          loadedValues.forEach(function(loadedVal) {
            valueOptions.push({ text: loadedVal, value: loadedVal });
          });
        }

        this.fieldConfig.getFeatureGuidelineField(this.i, guidelineGroupIndex, 'values').selectizeConfig.options = valueOptions;
        const $select = $(document.getElementById(this.i + '_associated_values_' + guidelineGroupIndex));
        if ($select[0]) {
          const selectize = $select[0].selectize;
          selectize.clear();
          selectize.clearOptions();
          selectize.load(function(callback) {
            callback(valueOptions);
          });
        }
        if (loadedValues && (<FormGroup>guidelineFormGroup).get('key').pristine) {
          (<FormArray>guidelineFormGroup.get('values')).at(0).get('values').setValue(loadedValues);
        }
      });
    });
  }

  removeField(i: number) {
    this.fields.removeAt(i);
  }
}
