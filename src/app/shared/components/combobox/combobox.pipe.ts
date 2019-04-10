import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'combobox-filter' })
export class ComboboxPipe implements PipeTransform {
  transform(dataToSort: string[], searchString: string, comboValues: any[]): any[] {
    let sorted: string[] = [];
    dataToSort.forEach(function(d: any) {
      let name = d.name as string;
      if (comboValues.includes(name)) { // ignore values already selected...
        return;
      }
      if (name.startsWith(searchString)) {
        sorted.push(d)
      }
    })
    return sorted;
  }
}