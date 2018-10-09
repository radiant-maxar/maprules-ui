import { Injectable } from '@angular/core';
import { FieldConfig } from '../../shared/interfaces/field-config.interface';

@Injectable({
  providedIn: 'root',
})


export class FieldConfigService {

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

  featureConfig: Map<number, FieldConfig[]> = new Map<number,FieldConfig[]>();
  primaryGroupConfig: Map<number, Map<number, FieldConfig>> = new Map<number, Map<number, FieldConfig>>();
  guidelineConfig: Map<number, Map<number, FieldConfig[]>> = new Map<number, Map<number, FieldConfig[]>>(); 
  disabledFeatureConfig: Map<number, FieldConfig[]> = new Map<number, FieldConfig[]>();

  constructor() {
  }

  get valConditionMap(){
    var valConditionMap = new Map<string, number>();
    valConditionMap.set("must be", 1);
    valConditionMap.set("may be", 2);
    valConditionMap.set("must not be", 0);
    valConditionMap.set("<", 3);
    valConditionMap.set("<=", 4);
    valConditionMap.set(">", 5);
    valConditionMap.set(">=", 6);
    return valConditionMap;
  }

  get keyConditionMap(){
    var keyConditionMap = new Map<string, number>();
    keyConditionMap.set("must have", 1);
    keyConditionMap.set("may have", 2);
    keyConditionMap.set("should not have", 0);
    return keyConditionMap;
  }
  
  getFieldConfig(name: string){
    var field = this.config.find((control) => control.name == name);
  	return field;
  }

  getFeatureConfig(i: number, name: string){
    return this.featureConfig.get(i).find((control) => control.name == name);
  }

  getFeaturePrimaryConfig(i: number){
   return this.primaryGroupConfig.get(i);
  }

  getPrimaryIdentifierConfig(i:number, primaryGroupIndex:number){
    return this.primaryGroupConfig.get(i).get(primaryGroupIndex);
  }

  getFeatureGuidelineConfig(i:number){
    return this.guidelineConfig.get(i);
  }
  
  getFeatureGuideline(i:number, guidelineIndex: number){
    return this.guidelineConfig.get(i).get(guidelineIndex);
  }

  getFeatureGuidelineField(i:number, guidelineIndex: number, field: string){
    return this.guidelineConfig.get(i).get(guidelineIndex).filter(fieldConfig => { return fieldConfig.name == field})[0];
  }

  getDisabledFeatureConfigMap(i: number){
    return this.disabledFeatureConfig.get(i);
  }

  getDisabledFeatureConfig(i: number, name: string){
    return this.disabledFeatureConfig.get(i).find((control) => control.name == name);
  }
}