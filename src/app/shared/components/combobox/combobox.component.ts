import { Component, Input, OnInit, forwardRef, AfterViewInit, Injector } from '@angular/core';
import { ComboboxPipe } from './combobox.pipe';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl, FormControl, FormControlName, FormArray } from '@angular/forms';
import { TagInfoService } from '../../../core/services/tag-info.service';
import { EditMapRuleComponent } from 'src/app/edit-maprule/edit-maprule.component';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { Observable } from 'rxjs';

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

  private _dataSource: string;
  @Input() set dataSource(dataSource: string) {
    this._dataSource = dataSource;
  };

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
  eventName: string;

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

  ngOnInit() {}

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
      this.eventName = `${this._comboIndex}:${this._formControlName}`

      // also make sure to initialize the input value!
    }

    this.sortText = this._formControl ? this._formControl.value : '';
    let resourceObservable: Observable<any>

    switch (this._dataSource) {
      case 'tagInfoService:popularKeys': {
        resourceObservable = this.tagInfoService.popularKeys();
        break;
      }
      case 'tagInfoService:tagValues': {
        resourceObservable = this.tagInfoService.tagValues(this._formControl.value);
        break;
      }
      default: {
        break;
      }
    }

    resourceObservable.subscribe(
      (next) => that.dataList = next, // set dataList to response from tagInfoService
      (error) => { console.log(error); that.dataList = [] } // or on fail, just init w/empty list...
    )

    this.fieldConfig.emitter.subscribe(
      (next) => {
        if (next.name === this.eventName) { // if emitted change val is for this combo, update dataList...
          this.dataList = next.data
        }
      },
      (error) => console.log(error)
    )

    this._formControl.valueChanges.subscribe(val => {
      that.textChange(val) // update dropdown list...
      switch (that._formControlName) { // emit event relevant to partner input...
        case 'primaryKey': { 
          that.comboKeyChanged(val, 'primaryVal');
          break;
        }
        // case 'primaryVal': {}
        default: {
          break;
        }
      }
    })
  }

  /**
   * when new input value is known in dataList, get matching values
   * and emit event to update its partner combobox...
   * @param key {string} tag key inputted in combobox
   * @param parterKey {string} the partner combobox's key...that combo only will update its dataList when given that event...
   */
  comboKeyChanged(key: string, partnerKey: string) {
    if (this.dataList.find(function(d) { return d.name === key; })) {
      this.tagInfoService.tagValues(key).subscribe(
        (next) => {
          let partnerEvent = `${this._comboIndex}:${partnerKey}`;
          this.fieldConfig.emitter.emit({ name: partnerEvent, data: next })
        }
      );
    }
  }

  // '0:0:primaryKey'
  // '0:0:primaryVal'
  // '0:0:fieldKey'
  // '0:0:fieldVal'
  // '0:disabledKey'

  // comboValChanged(val: string, keyType: string) {
  //   let primaryArray = this._formControl.parent.parent as FormArray;
  //   let [ presetIndex, primaryIndex ] = this._comboIndex.split(':');
  //   let nextPrimary = Number(primaryIndex)
  //   if (primaryArray.length - 1 === nextPrimary) {
  //     return;
  //   }

  //   if (this.dataList.find(function(d) { return d.name === val; })) {
  //     let key = this._formControl.parent.get('primaryKey').value;
  //     let nextIndex = `${presetIndex}:${nextPrimary}`
  //     this.tagInfoService.tagCombinations(key, val).subscribe(
  //       (next) => {
  //         let partnerEvent = `${keyType}:Key`
  //       }
  //     )
  //   }

  // }

  writeValue(value: any) {}
  onChange(newVal: any) {}
  onTouched(_?: any) {}
  registerOnTouched(fn: any): void {  this.onTouched = fn; }
  registerOnChange(fn: any): void { this.onChange = fn; }

  constructor(
    private comboboxPipe: ComboboxPipe,
    private tagInfoService: TagInfoService,
    private fieldConfig: FieldConfigService,
    private editMapRules: EditMapRuleComponent,
    private injector: Injector
  ) {}
}
