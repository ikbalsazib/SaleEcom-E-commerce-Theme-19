import {Pipe, PipeTransform} from '@angular/core';
import {CartVariation} from '../../interfaces/common/cart.interface';

@Pipe({
  name: 'variationInfoInline',
  standalone: true
})
export class VariationInfoInlinePipe implements PipeTransform {

  transform(value: CartVariation): string {
    if (value.option && value.name) {
      const options = value.option.split(", ");
      const names = value.name.split(", ");

      return options
        .map((option, index) => `${option}: ${names[index]}`)
        .join(", ");
    } else {
      return '';
    }



  }


}
