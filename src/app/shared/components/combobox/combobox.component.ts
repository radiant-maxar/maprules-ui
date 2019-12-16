import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit, ViewChild, ViewChildren, QueryList, Directive, ElementRef, ViewRef, SimpleChanges, OnChanges, EventEmitter, HostListener } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR, FormArray, FormGroup } from '@angular/forms';
import { of, Observable, Subject, BehaviorSubject } from 'rxjs';
import { FieldConfigService } from 'src/app/core/services/field-config.service';
import { EditMapRuleComponent } from 'src/app/edit-maprule/edit-maprule.component';
import { TagInfoService } from '../../../core/services/tag-info.service';
import { ComboboxPipe } from './combobox.pipe';
import { debounce, debounceTime, distinctUntilChanged, distinct, first, filter, skipWhile, throttle, throttleTime, distinctUntilKeyChanged, take } from 'rxjs/operators';

export enum KEY_CODE {
  ENTER = 13,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  TAB_KEY = 9,
  BACKSPACE = 8
}

// source and much thanks -> https://medium.com/@madhavmahesh/angular-6-component-creatiorotectedcombo-box-6b2eec03bece
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
export class ComboboxComponent implements OnInit, ControlValueAccessor {
  protected _formControl: FormControl;
  protected _formControlName: string;

  protected _comboIndex: string;
  @Input() set comboIndex(comboIndex: string) {
    this._comboIndex = comboIndex;
  }

  protected comboValues: string[] = [];
  protected _maxElements: number = Infinity;

  @Input() set maxElements(maxElements: number) {
    this._maxElements = !maxElements ? Infinity: maxElements;
  }

  protected dataList: any[] = [];
  protected dummyDataList: any[] = [];
  protected counter: number;
  protected showDropDown: boolean = false;
  protected sortText: string = '';
  protected _disabled: boolean = false;

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

  onKeyUpAction(event: KeyboardEvent): void {
    if (!event.currentTarget['value'].length && event.keyCode === KEY_CODE.BACKSPACE) {
      this.dummyDataList = this.filteredList();
      this.showDropDown = false;
      return;
    }
    let value = event.currentTarget['value'].trim();
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
    this.dummyDataList = this.comboboxPipe.transform(this.filteredList(), value);
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
    let value = (event.keyCode ? this.dummyDataList[counter].name : event.target.innerText).trim();
    if (!value.length) return;
    value = this.doUpdate(value)

    if (updateForm) {
      this._formControl.setValue(value);
    }

    return value;
  }

  selectText(value: string): string {
    if (!value.length) return;
    return this.doUpdate(value.trim());
  }

  filteredList(): any[] {
    let comboValues = this.comboValues.slice(); // new copy of array...
    let partnerValues = [];
    let formControlName = this._formControlName;
    if (formControlName.endsWith('Key')) { // if key, filter out any partner tag keys...
      let parentArray = this._formControl.parent.parent.value;
      let formIndex = Number(this._comboIndex[0]);
      parentArray.forEach(function (partner: any, index: number) {
        if (index === formIndex) return; // ignore the current key.
        let partnerKey = partner[formControlName];
        if (partnerKey.length) {
          partnerValues.push(partnerKey)
        }
      })
    }
    return this.dataList
      .filter(function (d) {
        if (comboValues.length) return !comboValues.includes(d.name);
        if (partnerValues.length) return !partnerValues.includes(d.name);
        else return true;
      })
      .sort(function (a, b) { return a.name - b.name });
  }

  ngOnInit() { }

  doChange(val: string) {}


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
    protected comboboxPipe: ComboboxPipe,
  ) { }
}