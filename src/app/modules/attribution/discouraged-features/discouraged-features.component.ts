import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { Field } from '../../../shared/interfaces/field.interface';
import { FieldConfig } from '../../../shared/interfaces/field-config.interface';
import { SelectizeOption } from '../../../shared/interfaces/selectize-option.interface';
import { AttributionComponent } from '../attribution.component';
import { FieldConfigService } from '../../../core/services/field-config.service';
import { TagInfoService } from '../../../core/services/tag-info.service';


declare var $: any;

@Component({
  selector: 'discouraged-features',
  styleUrls: [
    '../features/feature/feature.component.css',
    '../features/features.component.css',
    '../../../shared/components/content.group.css',
    './discouraged-features.component.css'
  ],
  templateUrl: './discouraged-features.html'
})
export class DiscouragedFeaturesComponent {
  @Input()
  config: FieldConfig[] = [];

  constructor(
    private fb: FormBuilder,
    private attribution: AttributionComponent,
    private fieldConfig: FieldConfigService,
    private tagInfo: TagInfoService
  ) {}  

  ngOnInit() {
    this.fieldConfig.disabledFeatureConfig = [];
    setTimeout(() => {
      this.tagInfo.popularTagsRequest.add(() => {
        this.loadDiscouragedFeatures();
      });
    });
  }

  loadDiscouragedFeatures(){
    if(this.attribution.loadedForm){
      var disabledFeatures = this.attribution.loadedForm['disabledFeatures'];
      if(disabledFeatures){
        var $scope = this;
        var index = 0;
        disabledFeatures.forEach(disabledFeature => {
          $scope.addDiscouragedFeature(disabledFeature);
          index++;
        });
      }
    }
  }

  addDiscouragedFeature(loadedFeature: FormGroup){
    var keyOptions = this.tagInfo.popularKeys;
    if(loadedFeature){
      keyOptions.push(<SelectizeOption>{text: loadedFeature['key'], value: loadedFeature['key']});
    }
    this.addDisabledKeyControl(keyOptions, loadedFeature);
  }

  addDisabledKeyControl(keyOptions: SelectizeOption[], loadedFeature: any){
    var disabledKeyConfig = this.fieldConfig.getDisabledKeyConfig(keyOptions);

    this.attribution.disabledFeatures.push(this.fb.group({}));

    const index = this.attribution.disabledFeatures.length == 0 ? 0 : this.attribution.disabledFeatures.length - 1;
    this.fieldConfig.disabledFeatureConfig.push([disabledKeyConfig]); 

    const disabledGroup = <FormGroup>this.attribution.disabledFeatures.at(index);
    disabledGroup.addControl("key", this.attribution.createControl(disabledKeyConfig));

    if(loadedFeature){
      this.addKeyListener(index, loadedFeature["val"]);
      (<FormArray>this.attribution.form.get("disabledFeatures")).at(index).get("key").setValue(loadedFeature['key']);
    } else {
      this.addKeyListener(index, null);
    }
  }

  addKeyListener(i: number, loadedVal: any){
    let disabledFormGroup = <FormGroup> this.attribution.disabledFeatures.at(i); 
    if(!disabledFormGroup){
      return;
    }
    disabledFormGroup.get("key").valueChanges.subscribe(val => { 
      setTimeout(() => { 
        var valueOptions = [];
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
        if(loadedVal){
          loadedVal.forEach((val) => {
            valueOptions.push(<SelectizeOption>{text: val, value: val});
          });
        }
        popularValuesRequest.add(() => {
          this.addDisabledValueControl(disabledFormGroup, i, valueOptions, loadedVal);
        });
      });
    });
  }


  addDisabledValueControl(disabledFormGroup: FormGroup, i: number, valueOptions: SelectizeOption[], loadedVal: any){
    var disabledValueConfig = this.fieldConfig.getDisabledValueConfig(valueOptions);
    var featureConfigMap = this.fieldConfig.disabledFeatureConfig[i];
    if(featureConfigMap.length == 1){          
      this.fieldConfig.disabledFeatureConfig[i].push(disabledValueConfig);
      disabledFormGroup.addControl('val', this.attribution.createControl(disabledValueConfig)); 
    } else {
      this.fieldConfig.refreshSelectizeOptions(i + "_val", valueOptions);
      featureConfigMap[1] = disabledValueConfig;
    }
    if(loadedVal && (<FormArray>this.attribution.form.get("disabledFeatures")).at(i).get("val").pristine){
      (<FormArray>this.attribution.form.get("disabledFeatures")).at(i).get("val").setValue(loadedVal);
    }
  }
 
  removeDisabledFeature(i: number){
    this.attribution.disabledFeatures.removeAt(i);
    this.fieldConfig.disabledFeatureConfig.splice(i,1);
  }
}
