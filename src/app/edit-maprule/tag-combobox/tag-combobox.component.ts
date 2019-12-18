import { AfterViewInit, Component, forwardRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { FieldConfigService } from '../../core/services/field-config.service';
import { TagInfoService } from '../../core/services/tag-info.service';
import { ComboboxPipe } from '../../shared/components/combobox/combobox.pipe';
import { ComboboxComponent } from '../../shared/components/combobox/combobox.component';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export enum KEY_CODE {
  ENTER = 13,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  TAB_KEY = 9,
  BACKSPACE = 8
}


// source and much thanks -> https://medium.com/@madhavmahesh/angular-6-component-creation-for-combo-box-6b2eec03bece
@Component({
  selector: 'app-tag-combobox',
  templateUrl: '../../shared/components/combobox/combobox.component.html',
  styleUrls: ['../../shared/components/combobox/combobox.component.css'],
  providers: [
    ComboboxPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagComboboxComponent),
      multi: true
    }
  ]
})
export class TagComboboxComponent extends ComboboxComponent implements AfterViewInit {
  /**
   * comboboxResourceMap!
   * This map keep track of what resource
   * a given tag combobox should use to fill its dataList
   *
   * the keys and values are updated by other changes made to the preset ui
   * For example, if I set a key=building for one combobox, an entry is added/updated
   * for its partner key to equal the tagInfo route for combinations for building.
   *
   * then, each time somebody opens the dropdown for that partner key, the combobox looks
   * in this resource map for whatever has been set for it, and goes and gets that resource (over http or from cache if its already cached)
   *
   * This sort of set of events (change combo, update resource for partner here, partner combo interaction leading to looking in this map for its resource)
   * applies for all the combo-partner relationships
   */
  static comboboxResourceMap: any = {};

  /**
   * updates the combo resource map. to delete, you just pass the key.
   */
  static updateComboResourceMap(key: any, resource: String) {
    return TagComboboxComponent.comboboxResourceMap[key] = resource;
  }

  static removeFromComboResourceMap(key: any) {
    delete TagComboboxComponent.comboboxResourceMap[key];
  }

  getComboResource(): void {
    // this._formControl
    let comboResource: Observable<any> = of([])
    switch (this._formControlName) {
      // if a non-partner dependent control, get resource.
      case 'fieldKeyCondition': {
        comboResource = of(FieldConfigService.KEY_CONDITIONS.map(function (cond, index) {
          return { name: cond, value: index };
        }))
        break;
      }
      case 'fieldValCondition': {
        comboResource = of(FieldConfigService.VAL_CONDITIONS.map(function (cond, index) {
          return { name: cond, value: index };
        }))
        break;
      }
      case 'disabledKey': { // disabled keys can always start with popular keys...
        comboResource = this.http.get(TagInfoService.POPULAR_KEYS_URL).pipe(TagInfoService.reducer(TagInfoService.POPULAR_KEYS_URL));
        break;
      }
      case 'disabledVal': { // disabled vals should start with values when key exists, otherwise, blank list...
        let key: string = this._formControl.parent.get('disabledKey').value;
        if (key.length) {
          let url = TagInfoService.tagValuesUrl(key);
          comboResource = this.http.get(url).pipe(TagInfoService.reducer(url));
        } else {
          comboResource = of([])
        }
        break;
      }
      default: { // for all others, compute the resource we need based on index.
        let formGroupIndex = Number(this._comboIndex[this._comboIndex.length - 1]);
        let formArray: FormArray = this._formControl.parent.parent as FormArray;
        let controlKey: string, controlVal: string;

        if (this._formControlName.indexOf('primary') === 0) {
          controlKey = 'primaryKey'
          controlVal = 'primaryVal'
        } else {
          controlKey = 'fieldKey'
          controlVal = 'fieldVal'
        }

        let url: string;
        if (formGroupIndex === 0) {
          if (this._formControlName.endsWith('Val')) {
            let key: string = this._formControl.parent.get(controlKey).value;
            if (key.length) url = TagInfoService.tagValuesUrl(key);
          } else {
            url = TagInfoService.POPULAR_KEYS_URL;
          }
        } else {
          if (this._formControlName.endsWith('Val')) {
            let key = formArray.at(formGroupIndex).get(controlKey).value;
            if (key.length) url = TagInfoService.tagValuesUrl(key);
          } else {
            let partnerGroup = formArray.at(formGroupIndex - 1) as FormGroup;
            let key: string = partnerGroup.get(controlKey).value;
            let val: string = partnerGroup.get(controlVal).value;
            url = key.length && val.length ? TagInfoService.tagCombinationsUrl(key, val) : TagInfoService.POPULAR_KEYS_URL;
          }
        }
        if (url.length) {
          comboResource = this.http.get(url).pipe(TagInfoService.reducer(url));
        }
        break;
      }
    }

    comboResource.subscribe(
      (next) => {
        // if nothing is returned for a key combo, go get popular keys
        if (next.length === 0 && this._formControlName.endsWith('Key')) {
          this.http
            .get(TagInfoService.POPULAR_KEYS_URL)
            .pipe(TagInfoService.reducer(TagInfoService.POPULAR_KEYS_URL))
            .subscribe((next) => {
              this.dataList = next;
              this.dummyDataList = this.filteredList();
            })
        } else {
          this.dataList = next;
          this.dummyDataList = this.filteredList();
        }
      },
      (error) => {
        console.log(error);
        this.dataList = [];
      }
    )
  }

  /** Removes values already selected for input,
   * Or, when it is a key, any values that are already
   * in a separate key form control's input
   */
  filteredDataList() {
    let comboValues = this.comboValues.slice(); // new copy of array...
    let valuesToIgnore = [];

    // for keys, see what is in other partner keys and ignore them.
    // also, ignore what is in different form groups.
    // so if this is the primary keys group, see what is in disabled features and
    // collect all keys to ignore. visa versa if 'this' is primary keys
    if (this._formControlName.endsWith('Key')) { // if key, filter out any partner tag keys...
      if (this._formControlName.indexOf('primary') === 0) {
        this._formControl.parent.parent.parent.parent.parent.get('disabledFeatures').value.forEach(function (d) {
          if (!d.disabledKey.length) return;
          valuesToIgnore.push(d.disabledKey);
        });
      } else {
        this._formControl.parent.parent.parent.get('presets').value.forEach(function (p) {
          p.primary.forEach(function (prim) {
            if (!prim.primaryKey.length) return;
            valuesToIgnore.push(prim.primaryKey);
          })
        })
      }

      let parentArray = this._formControl.parent.parent.value;
      let formIndex = Number(this._comboIndex[this._comboIndex.length - 1]);
      parentArray.forEach((partner: any, index: number) => {
        if (index === formIndex) return; // ignore the current key.

        let partnerValue = partner[this._formControlName];
        if (!partnerValue.length) return;

        valuesToIgnore.push(partnerValue)
      })
    }
    return this.dataList.filter(function (d) {
      if (comboValues.length) return !comboValues.includes(d.name);
      if (valuesToIgnore.length) return !valuesToIgnore.includes(d.name);
      return true;
    })
  }


  // https://stackoverflow.com/questions/44731894/get-access-to-formcontrol-from-the-custom-form-component-in-angular
  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.fieldConfig.emitter.subscribe(
      (next) => {
        if (
          next.type === 'dropdown' &&
          next.combo === (this._comboIndex + ':' + this._formControlName) &&
          next.value
        ) {
          this.getComboResource()
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  doChange(val: string) {
    if (/fieldKeyCondition/.test(this._formControlName)) {
      this.conditionChanged(val);
    } else if (/disabledKey/.test(this._formControlName)) {
      this.disabledKeyChanged(val);
    }
  }

  getPartnerEvent(partnerKey: string, nextIndex: boolean): string {
    let partnerIndex: string;
    if (nextIndex) {
      let [formArrayIndex, formGroupIndex] = this._comboIndex.split(':').map(function (pIndex) { return Number(pIndex); });
      partnerIndex = `${formArrayIndex}:${formGroupIndex + 1}`;
    } else {
      partnerIndex = this._comboIndex;
    }
    return `${partnerIndex}:${partnerKey}`
  }

  disabledKeyChanged(key: string): void {
    let resource = TagInfoService.tagValuesUrl(key);
    let partnerResourceLoc: string = this.getPartnerEvent('disabledVal', false);
    TagComboboxComponent.updateComboResourceMap(partnerResourceLoc, resource);
  }

  conditionChanged(val): void {
    let shouldDisable = FieldConfigService.KEY_CONDITIONS.indexOf(val) === 0;
    // this.fieldConfig.emitter.emit({
    //   name: this.getPartnerEvent('fieldVal', false),
    //   type: 'condition',
    //   disable: shouldDisable
    // })
    // this.fieldConfig.emitter.emit({
    //   name: this.getPartnerEvent('fieldValCondition', false),
    //   type: 'condition',
    //   disable: shouldDisable
    // })
  }

  /**
   * when new input value exists in the dataList, get matching values
   * and emit event to update its partner combobox...
   * @param key {string} tag key inputted in combobox
   */
  comboKeyChanged(key: string): void {
    let partnerKey: string = /primary/.test(this._formControlName) ? 'primaryVal' : 'fieldVal'
    let partnerResourceLoc: string = this.getPartnerEvent(partnerKey, false);
    let resource = TagInfoService.tagValuesUrl(key);
    TagComboboxComponent.updateComboResourceMap(partnerResourceLoc, resource);
  }

  /**
   * when new input exists in the dataList, go cache tag combinations..
   * and emit event to update partner combobox...
   * @param val {string} tag value inputted in combobox
   */
  comboValChanged(val: string): void {
    let partnerKey: string;
    let valKey: string;
    if (/primary/.test(this._formControlName)) {
      partnerKey = 'primaryKey';
      valKey = 'primaryVal'
    } else {
      partnerKey = 'fieldKey';
      valKey = 'fieldVal'
    }

    let key = this._formControl.parent.get(valKey).value;
    let resource = TagInfoService.keyCombinationsUrl(key, val);
    let partnerResourceLoc = this.getPartnerEvent(partnerKey, true);
    TagComboboxComponent.updateComboResourceMap(partnerResourceLoc, resource);
  }

  removeComboVal(comboIndex: number) {
    if (FieldConfigService.KEY_CONDITIONS.indexOf(this.comboValues[comboIndex]) === 2) {
      this.conditionChanged('') // enables partner combos...
    }
    super.removeComboVal(comboIndex);
  }

  writeValue(value: any) { }
  onChange(newVal: any) { }
  onTouched(_?: any) { }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  registerOnChange(fn: any): void { this.onChange = fn; }

  constructor(
    protected http: HttpClient,
    // protected editMapRules: EditMapRuleComponent,
    protected comboboxPipe: ComboboxPipe,
    protected fieldConfig: FieldConfigService,
    protected injector: Injector
  ) {
    super(comboboxPipe, fieldConfig, injector);
  }
}