import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'timestampDate'
})
export class TimestampDatePipe implements PipeTransform {
  transform(value: firebase.firestore.Timestamp, ...args: any[]): Date | null {
    return value ? value.toDate() : null;
  }
}
