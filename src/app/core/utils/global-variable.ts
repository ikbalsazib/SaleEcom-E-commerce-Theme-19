import {environment} from '../../../environments/environment';

export const DATABASE_KEY = Object.freeze({
  encryptUserLogin: 'SALEECOM_USER_1_' + environment.VERSION,
  websiteBuildFormData: 'SALEECOM_BUILD_INFO' + environment.VERSION,
  userCart: 'SALEECOM_CART' + environment.VERSION,
  userWishlist: 'SALEECOM_WISHLIST' + environment.VERSION,
  landingPageSetting: 'SALEECOM_L_SETTING' + environment.VERSION,
  userInfoForPixel: 'SALEECOM_Usr_Info' + environment.VERSION,
});
