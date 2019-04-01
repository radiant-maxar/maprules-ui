import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ComboboxComponent } from '../shared/components/combobox/combobox.component';
import { ComboboxPipe } from '../shared/components/combobox/combobox.pipe';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ ComboboxComponent, ComboboxPipe ],
  exports: [ ComboboxComponent ]
})
export class ComboboxModule { }
