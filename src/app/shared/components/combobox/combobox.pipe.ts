import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'combobox-filter' })
export class ComboboxPipe implements PipeTransform {
  transform(dataToSort: string[], searchString: string): any[] {
    let sorted: string[] = [];
    dataToSort.forEach(function(d: any) {
      let name = d.name as string;
      if (name.startsWith(searchString)) {
        sorted.push(d)
      }
    })
    return sorted;
  }
}