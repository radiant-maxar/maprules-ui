import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit, ViewChild, ViewChildren, QueryList, Directive, ElementRef, ViewRef, SimpleChanges, OnChanges, EventEmitter, HostListener } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { of, Observable, Subject, BehaviorSubject } from 'rxjs';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { EditMapRuleComponent } from 'src/app/edit-maprule/edit-maprule.component';
import { TagInfoService } from '../../../core/services/tag-info.service';
import { ComboboxPipe } from './combobox.pipe';
import { debounce, debounceTime, distinctUntilChanged, distinct, first, filter, skipWhile } from 'rxjs/operators';

export enum KEY_CODE {
  ENTER = 13,
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

  private comboValues: string[] = [];
  private _maxElements: number = Infinity;

  @Input() set maxElements(maxElements: number) {
    this._maxElements = !maxElements ? Infinity: maxElements;
  }

  private dataList: any[] = [];
  private dummyDataList: any[] = [];
  private showDropDown: boolean = false;
  private counter: number;
  private sortText: string = '';

  @ViewChild("comboInput") comboInput: ElementRef;
  @ViewChild("comboDataContainer") comboDataContainer: ElementRef;

  onClickEventAction(event: any): void {
    // make it easier to click on the input...
    if (['combo-cards-container', 'combo-input'].includes(event.target.className)) {
      this.comboInput.nativeElement.focus();
    }
  }

  onFocusEventAction(event: any): void {
    this.counter = -1;
  }



  onBlurEventAction(event: any): void {
    this.showDropDown = false;
  }

  onKeyDownAction(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case KEY_CODE.BACKSPACE: {
        if (!event.currentTarget['value'].length) {
          this.comboValues.pop();
          this._formControl.setValue(this.comboValues.join(','));
        }
        break;
      }
    }
  }

  onKeyUpAction(event: KeyboardEvent): void {
    if (!event.currentTarget['value'].length && event.keyCode === KEY_CODE.BACKSPACE) {
      this.dummyDataList = this.filteredList();
      this.showDropDown = false;
      return;
    }
    let value = event.currentTarget['value'];
    this.showDropDown = true;
    switch (event.keyCode) {
      case KEY_CODE.UP_ARROW: {
        if (this.counter !== 0) {
          --this.counter;
        }
        break;
      }
      case KEY_CODE.DOWN_ARROW: {
        if (!this.dummyDataList.length) {
          this.dummyDataList = this.filteredList();
        }

        if (this.counter < this.dummyDataList.length - 1) {
          this.counter++
        }

        if (this.counter === -1) return;

        this.checkHighlight(this.counter);
        break;
      }
      case KEY_CODE.ENTER: {
        value = 0 <= this.counter ? this.selectDropdown(event, this.getCounter()) : this.selectText(value);
        break;
      }
      case KEY_CODE.TAB_KEY: {
        if (!this.dummyDataList.length) {
          this.showDropDown = false;
          return;
        }
        value = 0 <= this.counter ? this.selectDropdown(event, this.getCounter()) : this.selectText(value);
        break;
      }
    }
    this._formControl.setValue(value);
  }

  getCounter(): number {
    return (0 <= this.counter && this.counter <= this.dummyDataList.length - 1) ? this.counter : 0;
  }

  checkHighlight(currentItem): boolean {
    return this.counter === currentItem;
  }

  reset(): void {
    this.showDropDown = false;
    this.dummyDataList = this.dataList;
  }

  toggleDropDown(): void {
    if (this._maxElements <= this.comboValues.length) {
      return
    }
    if (!this.dummyDataList.length) {
      this.dummyDataList = this.filteredList();
    }
    this.showDropDown = !this.showDropDown;
  }

  textChange(value: string): void {
    this.dummyDataList = this.comboboxPipe.transform(this.filteredList(), value, this.comboValues);
    this.showDropDown = 0 < this.dummyDataList.length
  }

  doUpdate(value: string): string {
    this.doChange(value);
    this.sortText = ''
    this.comboInput.nativeElement.value = this.sortText;
    this.comboValues.push(value)
    this.showDropDown = false;
    this.dummyDataList = this.filteredList();
    if (this.dummyDataList.length - 1 < this.counter) {
      this.counter = -1;
    }
    return this.comboValues.join();
  }

  selectDropdown(event: any, counter: number = this.counter, updateForm: boolean = true): string {
    let value = event.keyCode ? this.dummyDataList[counter].name : event.target.innerText;
    if (!value.length) return;
    value = this.doUpdate(value)

    if (updateForm) {
      this._formControl.setValue(value);
    }

    return value;
  }

  selectText(value: string): string {
    if (!value.length) return;
    return this.doUpdate(value);
  }

  filteredList(): any[] {
    let comboValues = this.comboValues.slice(); // new copy of array...
    let formControlName = this._formControlName;
    if (formControlName.endsWith('Key')) { // if key, filter out any partner tag keys...
      let parentArray = this._formControl.parent.parent as FormArray;
      parentArray.controls.forEach(function (control: FormGroup) {
        let partnerKey = control.controls[formControlName].value;
        if (partnerKey.length) {
          comboValues.push(partnerKey)
        }
      })
    }
    return this.dataList.filter(function (d) {
      return !comboValues.includes(d.name);
    }).sort(function (a, b) { return a.name - b.name });
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
        // if emitted change val is for this combo, update dataList...
        if (next.name === `${this._comboIndex}:${this._formControlName}`) {
          switch (next.type) {
            case 'data': {
              this.dataList = next.data
              break;
            }
            case 'condition': {
              // handle 'should not be' condition change...
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
    if (/(field|primary)Key/.test(this._formControlName)) {
      this.comboKeyChanged(val)
    } else if (/(field|primary)Val/.test(this._formControlName)) {
      this.comboValChanged(val);
    } else if (/keyCondition/.test(this._formControlName)) { // 3rd element in these lists === must/should not be...
      this.conditionChanged();
    } else if (/disabledKey/.test(this._formControlName)) {
      this.disabledKeyChanged(val);
    } else {}
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

  conditionChanged(): void {
    let partnerKey: string = /key/i.test(this._formControlName) ? 'fieldKey' : 'fieldVal';

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
    this.comboValues.splice(comboIndex, 1);
    this._formControl.setValue(this.comboValues.join(','))
    this.sortText = ''
    if (!this.comboValues.length) {
      setTimeout(() => this.comboInput.nativeElement.focus(), 150)
    }
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