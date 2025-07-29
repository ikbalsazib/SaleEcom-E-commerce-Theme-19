import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'secToTime',
  pure: true,
  standalone: true
})
export class SecToTimePipe implements PipeTransform {

  transform(second: number, type?: 'hour' | 'minute' | 'second' | 'H:M:S'): any {

    if (second) {
      const hours = Math.floor(second / 3600);
      const totalSeconds = second % 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (type === 'hour') {
        return `${hours < 10 ? '0' + hours : hours}`;

      } else if (type === 'minute') {
        return `${minutes < 10 ? '0' + minutes : minutes}`;
      } else if (type === 'second') {
        return `${seconds < 10 ? '0' + seconds : seconds}`;
      } else {
        return `${hours < 10 ? '0' + hours : hours} Hours, ${minutes < 10 ? '0' + minutes : minutes} Min, ${seconds < 10 ? '0' + seconds : seconds} Sec`;
      }
    } else {
      return '00';
    }

  }

}
