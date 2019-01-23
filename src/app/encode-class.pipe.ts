import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'encodeClass' })
export class EncodeClassPipe implements PipeTransform {

  transform(value: string): any {
    return value.split(' ').join('-');
  }

}
