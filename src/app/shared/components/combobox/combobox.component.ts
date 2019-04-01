import { Component, Input, OnInit } from '@angular/core';
import { ComboboxPipe } from './combobox.pipe';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TagInfoService } from 'src/app/core/services/tag-info.service';

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
  providers: [ ComboboxPipe ] 
})
export class ComboboxComponent implements OnInit {
  @Input()
  dataSource: string;

  dataList: any[] = [];
  dummyDataList: any[] = [];
  showDropDown: boolean;
  counter: number;
 
  sortText: String;

  onFocusEventAction(): void {
    this.counter = -1;
  }

  onBlurEventAction(): void {
    this.showDropDown = false;
  }

  onKeyDownAction(event: KeyboardEvent): void {
    if (!event.currentTarget['value'].length && event.keyCode === KEY_CODE.BACKSPACE) {
      return;
    }

    this.showDropDown = true;
    if (event.keyCode === KEY_CODE.UP_ARROW) {
      this.counter = (this.counter === 0) 
        ? this.counter
        : --this.counter;
      this.checkHighlight(this.counter);
      this.sortText = this.dataList[this.counter]['name'];
    } else if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      this.counter = (this.counter === this.dataList.length - 1) 
        ? this.counter
        : this.counter++;
      this.checkHighlight(this.counter);
      this.sortText = this.dataList[this.counter]['name'];
    }

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

  updateTextBox(selectedValue): void {
    this.sortText = selectedValue;
    this.showDropDown = false;
  }

  ngOnInit() {
    this.tagInfoService.getDatalist().subscribe(
      (next) => {
        this.dataList = next;
      }
    )
    this.reset()
  }
  
  constructor(
    private comboboxPipe: ComboboxPipe,
    private tagInfoService: TagInfoService
  ) { this.reset() }
}
