import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'MbPipe' })
export class MbPipe implements PipeTransform {

  constructor() { }

  transform(value: number) {
    const mb = ((value / 1024) / 1024).toFixed(2);
    return mb + ' MB';
  }
}