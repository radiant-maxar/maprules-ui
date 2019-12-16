import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, NgControl, NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { FieldConfigService } from '../../core/services/field-config.service';
import { EditMapRuleComponent } from '../edit-maprule.component';
import { TagInfoService } from '../../core/services/tag-info.service';
import { ComboboxPipe } from '../../shared/components/combobox/combobox.pipe';
import { ComboboxComponent } from '../../shared/components/combobox/combobox.component';

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
export class TagComboboxComponent extends ComboboxComponent
  implements AfterViewInit {
  // https://stackoverflow.com/questions/44731894/get-access-to-formcontrol-from-the-custom-form-component-in-angular
  ngAfterViewInit(): void {
    let that = this;
    const controlName: NgControl = this.injector.get(NgControl, null);
    // when the component is initially created, go get the formControl
    // and use it to set the control name and eventName this combobox will listen
    // the changes for...
    if (controlName) {
      this._formControl = controlName.control as FormControl;
      this._formControlName = controlName.name;
    }

    // make sure to initialize the input value!
    if (this._formControl && this._formControl.value) {
      setTimeout(() => { // there's a better way to do this...
        let comboValues = this._formControl.value.split(',');
        if (comboValues.length === 1 && this._maxElements === 1) {
          this.sortText = comboValues[0];
        } else {
          this.sortText = ''
        }

        this.comboValues = this.comboValues.concat(comboValues);
      })
    } else {
      this.sortText = '';
    }

    this.getResourceObservable().subscribe(
      (next) => {
        // set dataList to response from tagInfoService
        that.dataList = next
      },
      (error) => {
        // or on fail, just init w/empty list...
        console.log(error);
        that.dataList = []
      }
    )

    this.fieldConfig.emitter.subscribe(
      (next) => {
        if (next.type === 'clicked' && this.showDropDown) {
          this.showDropDown = false;
        }
        // if emitted change val is for this combo, update dataList...
        if (next.name === `${this._comboIndex}:${this._formControlName}`) {
          switch (next.type) {
            case 'data': {
              this.dataList = next.data
              break;
            }
            case 'condition': {
              this._disabled = next.disable;
              break;
            }
            default: {
              break;
            }
          }
        }
      },
      (error) => {
        console.log(error)
      }
    )

    this._formControl.valueChanges.subscribe(val => {
      if (val.length) this.textChange(val)
      this.comboInput.nativeElement.focus();
    })
  }

  doChange(val: string) {
    if (/^(field|primary)Key$/.test(this._formControlName)) {
      this.comboKeyChanged(val)
    } else if (/(field|primary)Val/.test(this._formControlName)) {
      this.comboValChanged(val);
    } else if (/fieldKeyCondition/.test(this._formControlName)) {
      this.conditionChanged(val);
    } else if (/disabledKey/.test(this._formControlName)) {
      this.disabledKeyChanged(val);
    }
  }

  getPartnerEvent(partnerKey: string, nextIndex: boolean): string {
    let partnerIndex: string;
    if (nextIndex) {
      let [formArrayIndex, formGroupIndex] = this._comboIndex.split(':').map(function (pIndex) { return Number(pIndex); });
      partnerIndex = `${formArrayIndex + 1}:${formGroupIndex + 1}`;
    } else {
      partnerIndex = this._comboIndex;
    }
    return `${partnerIndex}:${partnerKey}`
  }

  disabledKeyChanged(key: string): void {
    this.tagInfoService.tagValues(key).subscribe(
      (next) => {
        this.fieldConfig.emitter.emit({
          name: this.getPartnerEvent('disabledVal', false),
          type: 'data',
          data: next
        })
      },
      (error) => {
        console.log(error);
      }
    )
  }

  conditionChanged(val): void {
    let shouldDisable = FieldConfigService.KEY_CONDITIONS.indexOf(val) === 0;
    this.fieldConfig.emitter.emit({
      name: this.getPartnerEvent('fieldVal', false),
      type: 'condition',
      disable: shouldDisable
    })
    this.fieldConfig.emitter.emit({
      name: this.getPartnerEvent('fieldValCondition', false),
      type: 'condition',
      disable: shouldDisable
    })
  }

  /**
   * when new input value exists in the dataList, get matching values
   * and emit event to update its partner combobox...
   * @param key {string} tag key inputted in combobox
   */
  comboKeyChanged(key: string): void {
    let partnerKey: string = /primary/.test(this._formControlName) ? 'primaryVal' : 'fieldVal'
    this.tagInfoService.tagValues(key).subscribe(
      (next) => {
        this.fieldConfig.emitter.emit({
          name: this.getPartnerEvent(partnerKey, false),
          type: 'data',
          data: next
        })
      },
      (error) => {
        console.log(error);
      }
    );
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
    this.tagInfoService.keyCombinations(key, val).subscribe(
      (next) => {
        this.fieldConfig.emitter.emit({
          name: this.getPartnerEvent(partnerKey, true),
          data: next
        });
      },
      (error) => {
        console.log(error);
      }
    )
  }

  /**
   * uses combo index & formName to determine appropriate resource to populate combobox options with...
   */
  getResourceObservable(): Observable<any> {
    let resourceObservable: Observable<any>;
    switch (this._formControlName) {
      case 'fieldKeyCondition': { // combobox of key conditions...
        resourceObservable = of(FieldConfigService.KEY_CONDITIONS.map(function(condition, index) {
          return {
            name: condition,
            value: index
          }
        }))
        break;
      }
      case 'fieldValCondition': { // combobox of val
        resourceObservable = of(FieldConfigService.VAL_CONDITIONS.map(function (condition, index) {
          return {
            name: condition,
            value: index
          }
        }))
        break;
      }
      case 'disabledKey': { // disabled keys can always start with popular keys...
        resourceObservable = this.tagInfoService.popularKeys();
        break;
      }
      case 'disabledVal': { // disabled vals should start with values when key exists, otherwise, blank list...
        let key: string = this._formControl.parent.get('disabledKey').value;
        resourceObservable = key.length ? this.tagInfoService.tagValues(key) : of([]);
        break;
      }
      default: {
        let [formArrayIndex, formGroupIndex] = this._comboIndex.split(':').map(function (pIndex) { return Number(pIndex); });
        let isPopular = formGroupIndex === 0;
        let formArray: FormArray;
        let controlKey: string;
        let controlVal: string;

        if (/primary/.test(this._formControlName)) { // get proper FormArray && controlKeys and values
          formArray = this.editMapRules.presets.at(formArrayIndex).get('primary') as FormArray;
          controlKey = 'primaryKey'
          controlVal = 'primaryVal'
        } else {
          formArray = this.editMapRules.presets.at(formArrayIndex).get('fields') as FormArray;
          controlKey = 'fieldKey'
          controlVal = 'fieldVal'
        }

        if (!isPopular) {
          let partnerGroup = formArray.at(formGroupIndex - 1) as FormGroup;
          if (this._formControlName.endsWith('Val')) { // if value control, then init with empty data list...
            resourceObservable = of([])
          } else if (partnerGroup.get(controlKey).value.length && partnerGroup.get(controlVal).value.length) { // if partners have values, get tag combination...
            let key: string = partnerGroup.get(controlKey).value;
            let val: string = partnerGroup.get(controlVal).value;
            resourceObservable = this.tagInfoService.keyCombinations(key, val);
          } else { // otherwise, init with popular keys...
            resourceObservable = this.tagInfoService.popularKeys();
          }
        } else {
          if (this._formControlName.endsWith('Val')) { // if a value control and partner key has a value, get tagValues, otherwise empty data list...
            let key: string = this._formControl.parent.get(controlKey).value;
            resourceObservable = key.length ? this.tagInfoService.tagValues(key) : of([]);
          } else { // if popular first off, get popular keys....
            resourceObservable = this.tagInfoService.popularKeys();
          }
        }
        break;
      }
    }

    return resourceObservable;
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
    protected comboboxPipe: ComboboxPipe,
    private tagInfoService: TagInfoService,
    private fieldConfig: FieldConfigService,
    private editMapRules: EditMapRuleComponent,
    private injector: Injector
  ) {
    super(comboboxPipe);
  }
}