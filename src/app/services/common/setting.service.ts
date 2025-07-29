import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {DeliveryCharge, Setting, SocialLogin, UserOffer} from '../../interfaces/common/setting.interface';

const API_URL = environment.apiBaseLink + '/api/setting/';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  // Inject
  private readonly httpClient = inject(HttpClient);

  /**
   * getSetting()
   * getPaymentMethod()
   * getDeliveryCharge()
   * getChatLink()
   * getDeliveryChargesEasyCheckout()
   * getSocialLogins()
   * getOffers()
   * getUserOffers()
   */

  getSetting(select?: string, url?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    if (url) { //added later for url setting of product details 
      params = params.append('url', url);
    }
    return this.httpClient.get<{
      data: Setting,
      message: string,
      success: boolean
    }>(API_URL + 'get', {params});
  }


  getPaymentMethod() {
    return this.httpClient.get<{
      data: any,
      message: string,
      success: boolean
    }>(API_URL + 'get-payment-methods');
  }

  getDeliveryCharge() {
    return this.httpClient.get<{
      data: DeliveryCharge[],
      message: string,
      success: boolean
    }>(API_URL + 'get-delivery-charges');
  }

  getChatLink() {
    return this.httpClient.get<{
      data: any,
      message: string,
      success: boolean
    }>(API_URL + 'get-chat-link');
  }


  getDeliveryChargesEasyCheckout(division: string) {
    let params = new HttpParams();
    if (division) {
      params = params.append('division', division);
    }
    return this.httpClient.get<{
      data: DeliveryCharge[],
      message: string,
      success: boolean
    }>(API_URL + 'get-delivery-charges-easy-checkout', {params});
  }

  getSocialLogins() {
    return this.httpClient.get<{
      data: SocialLogin[],
      message: string,
      success: boolean
    }>(API_URL + 'get-social-logins');
  }

  getOffers() {
    return this.httpClient.get<{
      data: UserOffer[],
      message: string,
      success: boolean
    }>(API_URL + 'get-offers');
  }

  getUserOffers() {
    return this.httpClient.get<{
      data: UserOffer[],
      message: string,
      success: boolean
    }>(API_URL + 'get-user-offers');
  }

}
