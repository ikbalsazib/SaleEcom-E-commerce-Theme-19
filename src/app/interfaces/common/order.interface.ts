import {Area} from './area.interface';
import {Division} from './division.interface';
import {Product} from './product.interface';
import {Zone} from './zone.interface';

export type Order = {

  _id?: string;
  name?: string;
  phoneNo?: string;
  shippingAddress?: string;
  orderId: string;
  email?: string;
  paymentStatus?: string;
  paymentType?: string;
  orderStatus?: string | number;
  orderTimeline?: any;
  subTotal?: number;
  discount?: number;
  offerDiscount?: any;
  grandTotal?: number;
  couponDiscount?: any;
  productDiscount?: number;
  deliveryCharge?: number;
  checkoutDate?: string;
  note?: string;
  user?: string;
  registrationDate?: string;
  deliveryDate?: string;
  deliveryDateString?: string;
  preferredDateString?: string;
  preferredTime?: string;
  createdAt?: string;
  updatedAt?: string;
  deliveryNote?: string;
  deliverTime?: string;
  deliverDate?: string;
  deliveryAssignStatus?: string;
  deliveryCode?: string;
  carts?: string[];
  zone?: Zone;
  area?: Area;
  division?: any;
  orderedItems?: OrderedItem[];
};

export interface OrderedItem {
  // publisher: any;
  selectedQuantity: string;
  _id: string | Product;
  name: string;
  slug: string;
  milligram: string;
  image: string;
  category: any;
  subCategory: any;
  publisher: any;
  regularPrice: number;
  salePrice: number;
  unitPrice: number;
  quantity: number;
  orderType?: string;
  discountAmount: number;
  discountType: number;
  unit: string;
}
