import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'combobox-filter' })
export class ComboboxPipe implements PipeTransform {
  transform(dataToSort: string[], searchString: String): any[] {
    let sorted: string[] = [];
    dataToSort.forEach(function(d: any) {
      if (d.name.search(searchString)) {
        sorted.push(d)
      }
    })
    return sorted;
  }
}