import { AfterViewInit, Component, forwardRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { FieldConfigService } from '../../core/services/field-config.service';
import { TagInfoService } from '../../core/services/tag-info.service';
import { ComboboxPipe } from '../../shared/components/combobox/combobox.pipe';
import { ComboboxComponent } from '../../shared/components/combobox/combobox.component';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EditMapRuleComponent } from '../edit-maprule.component';

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

        let url: string = '';
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
        } else {
          comboResource = of([])
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

  // map of functions we can use
  // to get all keys in a given for group.
  ignoreFunctions = {
    primary: () => {
      return this.editMapRule.presets.value.reduce(function (toIgnore, p) {
        p.primary.forEach(function (prim) {
          if (!prim.primaryKey.length) return;
          toIgnore.push(prim.primaryKey);
        })
        return toIgnore;
      }, [])
    },
    fields: () => {
      return this.editMapRule.presets.value.reduce(function (toIgnore, p) {
        p.fields.forEach(function (f) {
          if (!f.fieldKey.length) return;
          toIgnore.push(f.fieldKey);
        })
        return toIgnore;
      }, [])
    },
    disabledFeatures: () => {
      return this.editMapRule.disabledFeatures.value.reduce(function(toIgnore, d) {
        if (d.disabledKey.length) {
          toIgnore.push(d.disabledKey);
        }
        return toIgnore;
      }, [])
    }
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
    if (this._formControlName.endsWith('Key')) {

      var formGroups = ['primary', 'fields', 'disabledFeatures']
      // first find the the formGroups that this formControl is not part of.
      // remove that from the list of formGroups we want to omits keys from.
      let indexToIgnore;
      if (this._formControlName.indexOf('primary') === 0) {
        indexToIgnore = 0;
      } else if (this._formControlName.indexOf('field') === 0) {
        indexToIgnore = 1;
      } else {
        indexToIgnore = 2;
      }

      formGroups.splice(indexToIgnore, 1)
      formGroups.forEach(g => {
        valuesToIgnore = valuesToIgnore.concat(this.ignoreFunctions[g]());
      })

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
        var fullComboIndex = this._comboIndex + ':' + this._formControlName;
        if (next.index !== fullComboIndex) return;
        if (next.type === 'dropdown') {
          this.getComboResource()
        }
        if (next.type === 'condition') {
          this._disabled = next.disabled;
        }
      },
      (error) => {
        console.log(error)
      }
    )
    this.getComboResource();
  }

  doUpdate(val: string): string {
    if (/fieldKeyCondition/.test(this._formControlName)) {
      this.conditionChanged(val);
    }
    return super.doUpdate(val)
  }

  conditionChanged(val): void {
    let shouldDisable = FieldConfigService.KEY_CONDITIONS.indexOf(val) === 0;
    this.fieldConfig.emitter.emit({
      index: this._comboIndex + ':fieldVal',
      type: 'condition',
      disable: shouldDisable
    })
    this.fieldConfig.emitter.emit({
      index: this._comboIndex + ':fieldValCondition',
      type: 'condition',
      disable: shouldDisable
    })
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
    protected editMapRule: EditMapRuleComponent,
    protected http: HttpClient,
    protected comboboxPipe: ComboboxPipe,
    protected fieldConfig: FieldConfigService,
    protected injector: Injector
  ) {
    super(comboboxPipe, fieldConfig, injector);
  }
}