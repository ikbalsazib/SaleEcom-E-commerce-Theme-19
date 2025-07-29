import {User} from './user.interface';
import {Product} from './product.interface';

export interface Cart {
  _id?: string;
  product?: string | Product;
  user?: string | User;
  selectedQty?: number;
  isSelected?: boolean;
  variation: CartVariation;
  createdAt?: Date;
  updatedAt?: Date;
  isWholesale?: boolean;
}

export interface CartVariation {
  _id?: string;
  name?: string;
  image?: string;
  option?: string;
  sku?: string;
  wholesalePrice?: string;
}
