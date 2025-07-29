import {Pipe, PipeTransform} from '@angular/core';
import {environment} from '../../../environments/environment';

@Pipe({
  name: 'arrToSingleImage',
  standalone: true
})
export class ArrayToSingleImagePipe implements PipeTransform {

  transform(images: string[], index?: number): string {
    if (images?.length) {
      if (index && images?.length > index) {
        return images[index];
      } else {
        return images[0];
      }
    } else {
      return `${environment.ftpBaseLink}/upload/static/placeholder.png?resolution=681_528`;
    }
  }

}
