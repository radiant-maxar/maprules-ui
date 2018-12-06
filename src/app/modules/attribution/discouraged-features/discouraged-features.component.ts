import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from "@angular/core";
import { Validators, FormGroup, FormBuilder, FormArray } from "@angular/forms";

import { Field } from "../../../shared/interfaces/field.interface";
import { FieldConfig } from "../../../shared/interfaces/field-config.interface";
import { SelectizeOption } from "../../../shared/interfaces/selectize-option.interface";
import { AttributionComponent } from "../attribution.component";
import { FieldConfigService } from "../../../core/services/field-config.service";
import { TagInfoService } from "../../../core/services/tag-info.service";

declare var $: any;

@Component({
  selector: "discouraged-features",
  styleUrls: [
    "../features/feature/feature.component.css",
    "../features/features.component.css",
    "../../../shared/components/content.group.css",
    "./discouraged-features.component.css"
  ],
  templateUrl: "./discouraged-features.html"
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

  panelIds: string[] = [];

  ngOnInit() {
    this.tagInfo.getCache(TagInfoService.POPULAR_TAGS_URL,TagInfoService.POPULAR_TAGS,[this.tagInfo.popularTagsMapper()]);
    this.loadDiscouragedFeatures();    
  }

  loadDiscouragedFeatures() {
    for (let disabledFeature of this.attribution.loadedForm["disabledFeatures"]!) {
      this.addDiscouragedFeature(disabledFeature);
    }
  }

  loadOptions(keyOptions): void {
    for (const key of $(document.querySelectorAll("#discouraged-feature-table .discouraged-key select"))) {
      this.fieldConfig.refreshSelectizeOptions(key, keyOptions, false);
    }
  }

  addDiscouragedFeature(loadedFeature: FormGroup) {
    // load up the initial selectize...
    let keyOptions = [];

    if (loadedFeature) {
      keyOptions.push(<SelectizeOption>{ text: loadedFeature.get("key"), value: loadedFeature.get("key") });
    }

    this.addDisabledKeyControl(keyOptions, loadedFeature);

    // if we're 'inflight', we don't let have something cached,
    // then load the initial options.
    if (this.tagInfo.isInflight(TagInfoService.POPULAR_TAGS)) {
      this.loadOptions(keyOptions);
    }

    this.tagInfo
      .getCache(TagInfoService.POPULAR_TAGS_URL, TagInfoService.POPULAR_TAGS, [this.tagInfo.popularTagsMapper()])
      .subscribe(observer => {
        // once we get response from tagInfo, or just can load from cache, load it up again.
        observer.next(options => {
          keyOptions = keyOptions.concat(options);
          this.loadOptions(keyOptions);
        });
      });
  }

  addDisabledKeyControl(keyOptions: SelectizeOption[], loadedFeature: any) {
    var disabledKeyConfig = this.fieldConfig.getDisabledKeyConfig(keyOptions);

    this.attribution.disabledFeatures.push(this.fb.group({}));

    const index =
      this.attribution.disabledFeatures.length == 0
        ? 0
        : this.attribution.disabledFeatures.length - 1;
    this.fieldConfig.disabledFeatureConfig.set(index, [disabledKeyConfig]);

    const disabledGroup = <FormGroup>(
      this.attribution.disabledFeatures.at(index)
    );
    disabledGroup.addControl(
      "key",
      this.attribution.createControl(disabledKeyConfig)
    );

    if (loadedFeature) {
      this.addKeyListener(index, loadedFeature["val"]);
      (<FormArray>this.attribution.form.get("disabledFeatures"))
        .at(index)
        .get("key")
        .setValue(loadedFeature["key"]);
    } else {
      this.addKeyListener(index, null);
    }
  }

  addKeyListener(i: number, loadedVal: any) {
    const disabledFormGroup = <FormGroup>this.attribution.disabledFeatures.at(i);
    if (!disabledFormGroup) { return; }
    const $scope = this;

    disabledFormGroup.get("key").valueChanges.subscribe(val => {
      let valueOptions = [];

      loadedVal!.forEach(val => valueOptions.push(<SelectizeOption>{ text: val, value: val }));
      $scope.addDisabledValueControl(disabledFormGroup, i, valueOptions, loadedVal);

      const popularValues: string = TagInfoService.popularValues(val);

      const lastVal = $(document.querySelectorAll("#discouraged-feature-table .discouraged-val select"))[i];
      if ($scope.tagInfo.isInflight(popularValues)) {
        $scope.fieldConfig.refreshSelectizeOptions(lastVal, valueOptions, true);
      }

      $scope.tagInfo
        .getCache(TagInfoService.tagValuesUrl(val), popularValues, [$scope.tagInfo.tagValuesMapper()])
        .subscribe(observer => {
          observer.next(options => {
            valueOptions = valueOptions
              .concat(options)
              .sort((a, b) => parseFloat(b.count) - parseFloat(a.count))
              .map((prop) => <SelectizeOption>{ text: prop.value, value: prop.value })

            $scope.fieldConfig.refreshSelectizeOptions(lastVal, valueOptions, false);
          })
        })
    });
  }

  addDisabledValueControl(
    disabledFormGroup: FormGroup,
    i: number,
    valueOptions: SelectizeOption[],
    loadedVal: any
  ) {
    var disabledValueConfig = this.fieldConfig.getDisabledValueConfig(
      valueOptions
    );
    var featureConfigMap = this.fieldConfig.getDisabledFeatureConfigMap(i);
    if (featureConfigMap.length == 1) {
      this.fieldConfig.disabledFeatureConfig.get(i).push(disabledValueConfig);
      disabledFormGroup.addControl(
        "val",
        this.attribution.createControl(disabledValueConfig)
      );
    } else {
      featureConfigMap[1] = disabledValueConfig;
    }
    if (
      loadedVal &&
      (<FormArray>this.attribution.form.get("disabledFeatures"))
        .at(i)
        .get("val").pristine
    ) {
      (<FormArray>this.attribution.form.get("disabledFeatures"))
        .at(i)
        .get("val")
        .setValue(loadedVal);
    }
  }

  removeDisabledFeature(i: number) {
    const control = this.attribution.disabledFeatures;
    control.removeAt(i);
  }
}
