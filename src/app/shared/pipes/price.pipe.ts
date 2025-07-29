import {inject, Pipe, PipeTransform} from '@angular/core';
import {DiscountTypeEnum} from '../../enum/product.enum';
import {UtilsService} from '../../services/core/utils.service';
import {PriceData, Product, VariationList} from "../../interfaces/common/product.interface";

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {

  // Inject
  private readonly utilsService = inject(UtilsService);

  transform(product: Product | PriceData | VariationList, type: 'salePrice' | 'discountAmount' | 'discountPercentage' | 'regularPrice', quantity?: number): number {
    if (product) {
      switch (type) {
        case 'salePrice': {
          if (product.discountType === DiscountTypeEnum.PERCENTAGE) {
            const disPrice = (product?.discountAmount / 100) * product?.salePrice;
            if (quantity) {
              return this.utilsService.roundNumber((product?.salePrice - disPrice) * quantity);
            }
            return this.utilsService.roundNumber(product?.salePrice - disPrice);
          } else if (product.discountType === DiscountTypeEnum.CASH) {
            if (quantity) {
              return this.utilsService.roundNumber((product?.salePrice - product.discountAmount) * quantity);
            }
            return this.utilsService.roundNumber(product?.salePrice - product.discountAmount);
          } else {
            if (quantity) {
              return this.utilsService.roundNumber((product?.salePrice) * quantity);
            }
            return this.utilsService.roundNumber(product?.salePrice);
          }
        }
        case 'discountAmount': {
          if (product.discountType === DiscountTypeEnum.PERCENTAGE) {
            if (quantity) {
              return this.utilsService.roundNumber(((product?.discountAmount / 100) * product?.salePrice) * quantity);
            }
            return this.utilsService.roundNumber((product?.discountAmount / 100) * product?.salePrice);
          } else if (product.discountType === DiscountTypeEnum.CASH) {
            if (quantity) {
              return product?.discountAmount * quantity;
            }
            return product?.discountAmount;
          } else {
            return 0;
          }
        }
        case 'discountPercentage': {
          if (product.discountType === DiscountTypeEnum.PERCENTAGE) {
            if (quantity) {
              return product?.discountAmount;
            }
            return product?.discountAmount;
          } else if (product.discountType === DiscountTypeEnum.CASH) {
            if (quantity) {
              return Math.round((product?.discountAmount / product?.salePrice) * 100);
            }
            return Math.round((product?.discountAmount / product?.salePrice) * 100);
          } else {
            return 0;
          }
        }
        case 'regularPrice': {
          if (quantity) {
            return this.utilsService.roundNumber(product?.salePrice * quantity);
          }
          return this.utilsService.roundNumber(product?.salePrice);
        }
        default: {
          return product?.salePrice;
        }
      }
    } else {
      return 0;
    }
  }

}
