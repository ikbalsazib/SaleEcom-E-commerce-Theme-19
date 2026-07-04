export interface TikTokContentItem {
  content_id: string;
  content_name: string;
  content_category: string;
  quantity: number;
  price: number;
}

export interface TikTokEventPayload {
  content_ids?: string[];
  content_type?: 'product';
  content_name?: string;
  content_category?: string;
  contents?: TikTokContentItem[];
  value?: number;
  currency?: string;
  quantity?: number;
  num_items?: number;
  order_id?: string;
  event_id?: string;
  email?: string;
  phone_number?: string;
  [key: string]: any;
}

export interface TikTokProductInput {
  _id?: string;
  name?: string;
  category?: { name: string } | string;
  price?: number;
  salePrice?: number;
  quantity?: number;
  [key: string]: any;
}

export interface TikTokCartItemInput {
  product?: TikTokProductInput;
  selectedQty?: number;
  [key: string]: any;
}

export interface TikTokOrderInput {
  _id: string;
  orderId?: string;
  totalAmount?: number;
  grandTotal?: number;
  checkoutItems?: any[];
  orderedItems?: any[];
  phoneNo?: string;
  email?: string;
  [key: string]: any;
}

export interface TrackTiktokEventDto {
  event: string;
  eventId: string;
  timestamp?: string;
  email?: string;
  phoneNo?: string;
  externalId?: string;
  ttclid?: string;
  ttp?: string;
  value?: number;
  currency?: string;
  contents?: any[];
  customProperties?: Record<string, any>;
  order_id?: string;
  [key: string]: any;
}
