export interface Invoice {
  _id?: string;
  shopLogo?: string;
  signatureImage?: string | null;
  shopName?: string;
  shopPhoneNo?: string;
  shopWhatsappNo?: string;
  shopAddress?: string;
  shopEmail?: string;
  orderId?: string;
  color?: string;
  websiteName?: string;
  address?: string;
  shippingAddress?: string;
  customerId?: string | null;
  name?: string;
  phoneNo?: string;
  domain?: string | null;
  date?: string; // Consider using Date type if needed
  paymentStatus?: 'unpaid' | 'paid' | 'pending'; // Define allowed statuses
  subTotal?: number;
  discount?: number;
  deliveryCharge?: number;
  couponDiscount?: number;
  grandTotal?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  variation?: string | null;
  category?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  subCategory?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  childCategory?: string | null;
  brand?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  product?: string;
  name?: string;
  slug?: string;
  image?: string;
  salePrice?: number;
  regularPrice?: number;
  costPrice?: number;
  quantity?: number;
  isReview?: boolean;
  model?: string;
  _id?: string;
}
