import { Component, forwardRef, Input, OnInit, ViewChild, ElementRef, Injector, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ComboboxPipe } from './combobox.pipe';
import { FieldConfigService } from 'src/app/core/services/field-config.service';

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
export class ComboboxComponent implements OnInit, ControlValueAccessor, AfterViewInit {
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

  dropDownUpdate(update: boolean) {
    if (update) {
      this.fieldConfig.emitter.emit({
        type: 'dropdown',
        combo: this._comboIndex + ':' + this._formControlName,
        value: update
      })
    }
    this.showDropDown = update;
  }

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
    this.dropDownUpdate(false);
  }

  onKeyUpAction(event: KeyboardEvent): void {
    let value = event.currentTarget['value'].trim();
    if (!event.currentTarget['value'].length && event.keyCode === KEY_CODE.BACKSPACE) {
      this._formControl.setValue(value);
      this.dummyDataList = this.filteredList();
      this.dropDownUpdate(false);
      return;
    }
    if (!value.length) return;
    this.dropDownUpdate(true);
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
          this.dropDownUpdate(false);
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
    this.dropDownUpdate(false);
    this.dummyDataList = this.dataList;
  }

  toggleDropDown(): void {
    if (this._maxElements <= this.comboValues.length) {
      return
    }
    if (!this.dummyDataList.length) {
      this.dummyDataList = this.filteredList();
    }
    this.dropDownUpdate(!this.showDropDown);
  }

  textChange(value: string): void {
    this.dummyDataList = this.filteredList();
    this.dropDownUpdate(0 < this.dummyDataList.length);
  }

  doUpdate(value: string): string {
    this.doChange(value);
    this.sortText = ''
    this.comboInput.nativeElement.value = this.sortText;
    this.comboValues.push(value)
    this.dropDownUpdate(false);
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


  /**
   * Function to be overwritten such that the
   * dataList is filtered specific to the combobox
   */
  filteredDataList(): Array<any> {
    return this.dataList;
  }

  filteredList(): any[] {
    return this.comboboxPipe.transform(this.filteredDataList(), this._formControl.value.toLowerCase())
  }

  doChange(val: string) {} // noop, implement in child classes

  removeComboVal(comboIndex: number) {
    this.comboValues.splice(comboIndex, 1);
    this._formControl.setValue(this.comboValues.join(','))
    this.sortText = ''
    if (!this.comboValues.length) {
      setTimeout(() => this.comboInput.nativeElement.focus(), 150)
    }
  }


  // get the form control and listen to changes...
  ngAfterViewInit(): void {
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

    this._formControl.valueChanges.subscribe(val => {
      if (val && val.length) this.textChange(val)
      this.comboInput.nativeElement.focus();
    })
  }

  // needed noops
  ngOnInit() { }
  writeValue(value: any) { }
  onChange(newVal: any) { }
  onTouched(_?: any) { }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  registerOnChange(fn: any): void { this.onChange = fn; }

  constructor(
    protected comboboxPipe: ComboboxPipe,
    protected fieldConfig: FieldConfigService,
    protected injector: Injector
  ) { }
}