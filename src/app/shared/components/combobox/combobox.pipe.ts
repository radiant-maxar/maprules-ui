import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'combobox-filter' })
export class ComboboxPipe implements PipeTransform {
  /**
   * finds any strings that match input.
   * returns results with strings that start with match first,
   * then the rest of the strings come after.
   */
  transform(dataToFilter: string[], searchString: string): any[] {
    let leading = [], trailing = [];
    dataToFilter.forEach(function (d: any) {
      let matchIndex = d.name.toLowerCase().indexOf(searchString);
      if (matchIndex === 0) leading.push(d);
      else if (matchIndex !== -1) trailing.push(d)
    })
    return leading.sort().concat(trailing.sort());
  }
}