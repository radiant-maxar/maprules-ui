import { Pipe, PipeTransform } from '@angular/core';

/**
 * Given condition, be it key or value, replies english version
 */
@Pipe({ name: 'decodeCondition' })
export class DecodeConditionPipe implements PipeTransform {

  transform(condition: number): string {
    switch (condition) {
      case 0 : return 'must not';
      case 1 : return 'must';
      case 2 : return 'may';
      case 3 : return '<';
      case 4 : return '<=';
      case 5 : return '>';
      case 6 : return '>=';
      default: return '';
    }
  }
}
