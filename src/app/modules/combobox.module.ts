import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ComboboxComponent } from '../shared/components/combobox/combobox.component';
import { TagComboboxComponent } from '../edit-maprule/tag-combobox/tag-combobox.component'
import { ComboboxPipe } from '../shared/components/combobox/combobox.pipe';

@NgModule({
  imports:      [ BrowserModule, ReactiveFormsModule ],
  declarations: [ ComboboxComponent, TagComboboxComponent, ComboboxPipe ],
  exports: [ ComboboxComponent, TagComboboxComponent ]
})
export class ComboboxModule { }
