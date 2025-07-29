import {User} from './user.interface';
import {VariationOption} from './variation.interface';
import {Product} from './product.interface';

export interface Wishlist {
  _id?: string;
  product?: Product | any;
  user?: string | User;
  selectedQty?: number;
  costPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isSelected: boolean;
  selectedVariation?: VariationOption;
  variation: any | VariationList;
}

interface VariationList {
  _id?: string;
  name?: string;
  sku?: string;
  image?: string;
  salePrice?: number;
  discountType?: number;
  discountAmount?: number;
  quantity?: number;
  trackQuantity?: number;
}
