import { Injectable, EventEmitter } from '@angular/core';
import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { Validators} from '@angular/forms';
declare var $: any;

@Injectable({
  providedIn: 'root',
})


export class FieldConfigService {
  static KEY_CONDITIONS: String[] = [
    'must not have',
    'must have',
    'may have'
  ];

  static VAL_CONDITIONS: String[] = [
    'must not be',
    'must be',
    'may be',
    '<', '<=',
    '>', '>='
  ]

  static keyCondition(condition: number) {
    return this.KEY_CONDITIONS[condition];
  }

  static valCondition(condition: number) {
    return this.VAL_CONDITIONS[condition];
  }

  config: FieldConfig[] = [
    {
      type: 'input',
      label: 'MapRule Name',
      name: 'name',
      placeholder: 'MapRule name',
      hint: 'Add name for MapRule'
    },
    {
      type: 'entities',
      label: 'Presets',
      name: 'entities',
      hint: 'Add preset for MapRule'
    },
    {
      type: 'discouraged',
      name: 'disabledFeatures',
      label: 'Do Not Map the Following Entities',
      hint: 'Add feature that should not be map.'
    }
  ];

  featureConfig: FieldConfig[][] = [];
  primaryGroupConfig: Map<number, Map<number, FieldConfig>> = new Map<number, Map<number, FieldConfig>>();
  guidelineConfig: Map<number, Map<number, FieldConfig[]>> = new Map<number, Map<number, FieldConfig[]>>();
  disabledFeatureConfig: FieldConfig[][] = [];

  emitter: EventEmitter<any> = new EventEmitter();
  geom: Array<string> = [ 'Area', 'Line', 'Point' ]

  constructor() {}

  get geometry() {
    return this.geom;
  }

  getFieldConfig(name: string) {
    const field = this.config.find((control) => control.name === name);
    return field;
  }

  getFeatureConfig(i: number, name: string) {
    return this.featureConfig[i].find((control) => control.name === name);
  }

  getFeaturePrimaryConfig(i: number) {
   return this.primaryGroupConfig.get(i);
  }

  getGuidelineFieldConfig(i: number, guidelineGroupIndex: number, keyOptions: any[]) {
    let keyConditionMap: Map<string, number> = new Map<string, number>()
      .set('must have', 1)
      .set('may have', 2)
      .set('should not have', 0);

    let valConditionMap: Map<string, number> = new Map<string, number>()
      .set('must be', 1)
      .set('may be', 2)
      .set('must not be', 0)
      .set('<', 3)
      .set('<=', 4)
      .set('>', 5)
      .set('>=', 6);

    return [ {
                            type: 'guideline',
                            name: 'keyCondition',
                            optionMap: keyConditionMap,
                            validation: [Validators.required] // TODO make validation work for these fields
                          },
                          {
                            type: 'guidelineSelectize',
                            name: 'key',
                            id: i + '_associated_key_' + guidelineGroupIndex,
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
                            optionMap: valConditionMap
                           },
                          {
                            type: 'valueSelectize',
                            name: 'values',
                            id: i + '_associated_values_' + guidelineGroupIndex,
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
  }
  getPrimaryKeyConfigSettings(keyOptions: any[]){
    return {  type: 'primary',
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
  }
 getPrimaryValueConfigSettings(valueOptions: any[]){
  var valConfig = {
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
    return valConfig;
  }

  getPrimaryIdentifierConfig(i: number, primaryGroupIndex: number) {
    return this.primaryGroupConfig.get(i).get(primaryGroupIndex);
  }

  getFeatureGuidelineConfig(i: number) {
    return this.guidelineConfig.get(i);
  }

  getFeatureGuideline(i: number, guidelineIndex: number) {
    return this.guidelineConfig.get(i).get(guidelineIndex);
  }

  getFeatureGuidelineField(i: number, guidelineIndex: number, field: string) {
    return this.guidelineConfig.get(i).get(guidelineIndex).filter(fieldConfig => fieldConfig.name === field)[0];
  }

  haveFeatureGuidelineField(i: number, guidelineIndex: number, field: string) {
    return this.guidelineConfig.get(i).get(guidelineIndex).findIndex(fieldConfig => fieldConfig.name === field) >= 0;
  }

  getDisabledFeatureConfigMap(i: number) {
    return this.disabledFeatureConfig[i];
  }

  getDisabledFeatureConfig(i: number, name: string) {
    return this.disabledFeatureConfig[i].find((control) => control.name === name);
  }

  getDisabledKeyConfig(keyOptions: any[]){
    return { type: 'selectize',
             name: 'key',
             selectizeConfig: {
                                create: true,
                                persist: true,
                                maxItems: 1,
                                options: keyOptions,
                                plugins: ['dropdown_direction'],
                                dropdownDirection: 'down'
                              }
             };
  }

  getDisabledValueConfig(valueOptions: any[]){
    return {
      type: 'selectize',
      name: 'val',
      value: "",
      selectizeConfig: {
                          create: true,
                          persist: true,
                          maxItems: null,
                          options: valueOptions,
                          allowEmptyOption: false,
                          plugins: ['dropdown_direction', 'remove_button'],
                          dropdownDirection: 'down'
                        }
    };
  }

  refreshSelectizeOptions(id: string, valueOptions: any[]){
    var $select = $(document.getElementById(id));
    if($select[0]){
      var selectize = $select[0].selectize;
      selectize.clear();
      selectize.clearOptions();
      selectize.load(function(callback) {
        callback(valueOptions);
      });
    }
  }
}
