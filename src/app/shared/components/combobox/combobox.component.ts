import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { EditMapRuleComponent } from 'src/app/edit-maprule/edit-maprule.component';
import { TagInfoService } from '../../../core/services/tag-info.service';
import { ComboboxPipe } from './combobox.pipe';

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  TAB_KEY = 9,
  BACKSPACE = 8
}

// source and much thanks -> https://medium.com/@madhavmahesh/angular-6-component-creation-for-combo-box-6b2eec03bece

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.css'],
  providers: [
    ComboboxPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true
    }
  ]
})
export class ComboboxComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  private _formControl: FormControl;
  private _formControlName: string;

  private _comboIndex: string;
  @Input() set comboIndex(comboIndex: string) {
    this._comboIndex = comboIndex;
  }

  dataList: any[] = [];
  dummyDataList: any[] = [];
  showDropDown: boolean;
  counter: number;
  sortText: string = '';
  _value: string = '';

  onFocusEventAction(): void {
    this.counter = -1;
  }

  onBlurEventAction(event: any): void {
    // this.showDropDown = false;
  }

  onKeyDownAction(event: KeyboardEvent): void {
    if (!event.currentTarget['value'].length && event.keyCode === KEY_CODE.BACKSPACE) {
      this.dummyDataList = this.dataList;
      this.showDropDown = false;
      return;
    }

    this.showDropDown = true;
    if (event.keyCode === KEY_CODE.UP_ARROW) {
      this.counter = (this.counter === 0)
        ? this.counter
        : --this.counter;

      if (this.counter === -1) return;

      this.checkHighlight(this.counter);
      this.sortText = this.dataList[this.counter]['name'];
    } else if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      this.counter = (this.counter === this.dataList.length - 1)
        ? this.counter
        : this.counter++;

      if (this.counter === -1) return;

      this.checkHighlight(this.counter);
      this.sortText = this.dataList[this.counter]['name'];
    }
    this._formControl.setValue(event.target['value']);
  }

  checkHighlight(currentItem): boolean {
    return this.counter === currentItem;
  }

  reset(): void {
    this.showDropDown = false;
    this.dummyDataList = this.dataList;
  }

  toggleDropDown(): void {
    this.showDropDown = !this.showDropDown;
  }

  textChange(value): void {
    this.dummyDataList = [];
    if (value.length > 0) {
      this.dummyDataList = this.comboboxPipe.transform(this.dataList, value);
      if (this.dummyDataList.length) {
        this.showDropDown = true;
      }
    } else {
      this.reset();
    }
  }

  selectDropdown(event: any): void {
    this.sortText = event.target.innerText;
    this._formControl.setValue(event.target.innerText)
    this.showDropDown = false;
  }

  ngOnInit() { }

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
    this.sortText = this._formControl ? this._formControl.value : '';

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
        // if emitted change val is for this combo, update dataList...
        if (next.name === `${this._comboIndex}:${this._formControlName}`) {
          switch (next.type) {
            case 'data': {
              this.dataList = next.data
              break;
            }
            case 'condition': {
              // handle condition change
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
      // update this combobox dropdown...
      that.textChange(val)

      if (this.dataList.findIndex(function (d) { return d.name === val; }) === -1) {
        return;
      }

      if (/(fields|primary)Key/.test(this._formControlName)) {
        that.comboKeyChanged(val)
      } else if (/(fields|primary)Val/.test(this._formControlName)) {
        that.comboValChanged(val);
      } else if (/keyCondition/.test(this._formControlName)) { // 3rd element in these lists === must/should not be...
        that.conditionChanged(val);
      } else if (/disabledFeatureKey/.test(this._formControlName)) {
        that.disabledKeyChanged(val);
      } else {
        // just remove from show list...
      }
    })
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

  conditionChanged(key: string): void {
    let partnerKey: string = /key/i.test(this._formControlName) ? 'fieldsKey' : 'fieldsVal';

    if (this._formControl.value === 2) { // must not and should both have an index === 3
      this.fieldConfig.emitter.emit({
        name: this.getPartnerEvent(partnerKey, false),
        type: 'condition'
      })
    }
    // else {
    //   this.tagInfoService.tagValues(key).subscribe(
    //     (next) => {
    //       this.fieldConfig.emitter.emit
    //     }
    //   )
    // }
  }

  /**
   * when new input value exists in the dataList, get matching values
   * and emit event to update its partner combobox...
   * @param key {string} tag key inputted in combobox
   */
  comboKeyChanged(key: string): void {
    let partnerKey: string = /primary/.test(this._formControlName) ? 'primaryVal' : 'fieldsVal'
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
      partnerKey = 'fieldsKey';
      valKey = 'fieldsVal'
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

  writeValue(value: any) { }
  onChange(newVal: any) { }
  onTouched(_?: any) { }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  registerOnChange(fn: any): void { this.onChange = fn; }

  constructor(
    private comboboxPipe: ComboboxPipe,
    private tagInfoService: TagInfoService,
    private fieldConfig: FieldConfigService,
    private editMapRules: EditMapRuleComponent,
    private injector: Injector
  ) { }
}
