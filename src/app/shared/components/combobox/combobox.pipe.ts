import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'combobox-filter' })
export class ComboboxPipe implements PipeTransform {
  transform(dataToSort: string[], searchString: string): any[] {
    return dataToSort.filter(function (d: any) {
      return d.name.includes(searchString)
    });
  }
}