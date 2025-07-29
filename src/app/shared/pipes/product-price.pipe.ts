import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'productPrice',
  standalone: true
})
export class ProductPricePipe implements PipeTransform {

  transform(product: any, type: 'regularPrice' | 'salePrice' | 'discountAmount' | 'discountPercentage', variationId?: string, quantity?: number, isWholesale?: boolean): number {
    if (product) {
      switch (type) {
        case 'salePrice': {
          if (product.isVariation && product.variationList.length) {
            const item = product.variationList.find(f => f._id === (variationId ?? product.variationList[0]._id));
            if (item) {
              if (quantity) {
                return Math.round(((isWholesale ? item.wholesalePrice : item.salePrice) ?? 0) * quantity);
              }
              return (isWholesale ? item.wholesalePrice : item.salePrice) ?? 0;
            } else {
              return 0;
            }
          } else {
            if (quantity) {
              return Math.round(( (isWholesale ? product.wholesalePrice : product.salePrice) ?? 0) * quantity);
            }
            return (isWholesale ? product.wholesalePrice : product.salePrice) ?? 0;
          }
        }
        // case 'wholesalePrice': {
        //   if (product.isVariation && product.variationList.length) {
        //     const item = product.variationList.find(f => f._id === (variationId ?? product.variationList[0]._id));
        //     if (item) {
        //       if (quantity) {
        //         return Math.round((item.wholesalePrice ?? 0) * quantity);
        //       }
        //       return item.wholesalePrice ?? 0;
        //     } else {
        //       return 0;
        //     }
        //   } else {
        //     if (quantity) {
        //       return Math.round((product.wholesalePrice ?? 0) * quantity);
        //     }
        //     return product.wholesalePrice ?? 0;
        //   }
        // }

        case 'regularPrice': {
          if (product.isVariation && product.variationList.length) {
            const item = product.variationList.find(f => f._id === (variationId ?? product.variationList[0]._id));
            if (item) {
              if (quantity) {
                return Math.round((item.regularPrice ?? 0) * quantity);
              }
              return item.regularPrice ?? 0;
            } else {
              return 0;
            }
          } else {
            if (quantity) {
              return Math.round((product.regularPrice ?? 0)* quantity);
            }
            return product.regularPrice ?? 0;
          }
        }

        case 'discountAmount': {
          if (product.isVariation && product.variationList.length) {
            const item = product.variationList.find(f => f._id === (variationId ?? product.variationList[0]._id));
            if (item) {
              if (quantity) {
                return Math.round(((item.regularPrice ?? 0) - (item.salePrice ?? 0)) * quantity);
              }
              return (item.regularPrice ?? 0) - (item.salePrice ?? 0);
            } else {
              return 0;
            }
          } else {
            if (quantity) {
              return Math.round(((product.regularPrice ?? 0) - ((isWholesale ? product.wholesalePrice : product.salePrice) ?? 0)) * quantity);
            }
            return (product.regularPrice ?? 0) - ((isWholesale ? product.wholesalePrice : product.salePrice) ?? 0);
          }
        }

        case 'discountPercentage': {
          if (product.isVariation && product.variationList.length) {
            const item = product.variationList.find(f => f._id === (variationId ?? product.variationList[0]._id));
            if (item) {
              if (quantity) {
                return Math.round(((((item.regularPrice ?? 0) - (item.salePrice ?? 0)) / (item.regularPrice ?? 0)) * 100) * quantity);
              }
              return Math.round((((item.regularPrice ?? 0) - (item.salePrice ?? 0)) / (item.regularPrice ?? 0)) * 100)
            } else {
              return 0;
            }
          } else {
            if (quantity) {
              return Math.round(((((product.regularPrice ?? 0) - ((isWholesale ? product.wholesalePrice : product.salePrice) ?? 0)) / (product.regularPrice ?? 0)) * 100) * quantity);
            }
            return Math.round((((product.regularPrice ?? 0) - ((isWholesale ? product.wholesalePrice : product.salePrice) ?? 0)) / (product.regularPrice ?? 0)) * 100);

          }
        }

        default: {
          return (isWholesale ? product.wholesalePrice : product.salePrice) ?? 0;
        }
      }
    } else {
      return 0;
    }
  }

}
