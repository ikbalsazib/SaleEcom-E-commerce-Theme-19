import { Pipe, PipeTransform } from '@angular/core';
import {UtilsService} from '../../services/core/utils.service';
import {DiscountTypeEnum} from "../../enum/product.enum";
import {Product} from "../../interfaces/common/product.interface";

@Pipe({
  name: 'priceRange',
  standalone: true,
})
export class PriceRangePipe implements PipeTransform {

  constructor(
    private utilsService: UtilsService
  ) {
  }

  transform(product: Product, type: 'salePrice' | 'regularPrice'): any {

    if (product) {
      if (product.isVariation) {
        if (type === 'salePrice') {
          const prices = product.variationList.map(m => {
            let price: number = 0;
            if (m.discountType === DiscountTypeEnum.PERCENTAGE) {
              const disPrice = (m?.discountAmount / 100) * m?.salePrice;
              price =  this.utilsService.roundNumber(m?.salePrice - disPrice);
            } else if (m.discountType === DiscountTypeEnum.CASH) {
              price = this.utilsService.roundNumber(m?.salePrice - m.discountAmount);
            } else {
              price = this.utilsService.roundNumber(m?.salePrice);
            }
            return price
          });
          return this.utilsService.numbersToRangeStrings(prices);
        }  else if (type === 'regularPrice') {
          const prices = product.variationList.map(m => m.salePrice);
          return this.utilsService.numbersToRangeStrings(prices);
        }
      } else {
        if (type === 'salePrice') {
          if (product.discountType === DiscountTypeEnum.PERCENTAGE) {
            const disPrice = (product?.discountAmount / 100) * product?.salePrice;
            return this.utilsService.roundNumber(product?.salePrice - disPrice);
          } else if (product.discountType === DiscountTypeEnum.CASH) {
            return this.utilsService.roundNumber(product?.salePrice - product.discountAmount);
          } else {
            return this.utilsService.roundNumber(product?.salePrice);
          }
        } else if (type === 'regularPrice') {
          return this.utilsService.roundNumber(product?.salePrice);
        }
      }
    }
    else {
      return 0;
    }
  }

}
