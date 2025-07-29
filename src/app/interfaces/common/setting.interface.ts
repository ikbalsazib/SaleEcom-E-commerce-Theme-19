export interface DeliveryCharge {
  name?: string;
  type?: string;
  city?: string;
  insideCity?: number;
  outsideCity?: number;
  freeDeliveryMinAmount?: number;
  note?: string;
  deliveryCharge?: number;
  isAdvancePayment?: boolean;
}

export interface SocialLogin {
  providerName?: string;
  authId?: string;
}

export interface UserOffer {
  offerType?: string;
  discount?: string;
}

export interface ThemeViewSetting {
  type: string;
  value: string[];
}

export interface PageViewSetting {
  name: string;
  type: string;
  isLoginRequire: boolean;
}


interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface SmsSendingOption {
  orderPlaced: boolean;
  orderConfirmed: boolean;
  orderDelivered: boolean;
  orderCanceled: boolean;
}


export interface Setting {
  _id?: string;
  deliveryCharges?: DeliveryCharge[];
  socialLogins: SocialLogin[];
  offers: UserOffer[];
  shop: string;
  googleSearchConsoleToken: string;
  themeViewSettings: ThemeViewSetting[];
  pageViewSettings: PageViewSetting[];
  searchHints: string;
  themeColors: ThemeColors;
  paymentMethods: any[];
  smsMethods: any[];
  blog: any;
  orderPhoneValidation: any;
  courierMethods: any[];
  smsSendingOption: SmsSendingOption;
  facebookPixel: string;
  googleTagManager: any;
  analytics: any;
  orderSetting: any;
  deliveryOptionType: any;
  productSetting: any;
  incompleteOrder: any;
  advancePayment: any[];
  currency: any;
  country: any;
}
