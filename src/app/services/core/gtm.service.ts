import {Inject, inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {GtmPageView, GtmViewContent} from '../../interfaces/core/gtm.interface';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';

const API_URL = environment.apiBaseLink + '/api/gtag';

declare global {
  interface Window {
    dataLayer: Array<any>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private _isManageFbPixelByTagManager: boolean = false;
  private _facebookPixelId: string;
  private _tagManagerId: string;
  private isBrowser: boolean;
  private readonly http = inject(HttpClient);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && !window.dataLayer) {
      window.dataLayer = [];
    }
  }


  get facebookPixelId(): string {
    return this._facebookPixelId;
  }

  get tagManagerId(): string {
    return this._tagManagerId;
  }

  get isManageFbPixelByTagManager(): boolean {
    return this._isManageFbPixelByTagManager;
  }


  set isManageFbPixelByTagManager(isManageFbPixelByTagManager: boolean) {
    this._isManageFbPixelByTagManager = isManageFbPixelByTagManager;
  }

  set tagManagerId(tagManagerId: string) {
    this._tagManagerId = tagManagerId;
  }

  set facebookPixelId(facebookPixelId: string) {
    this._facebookPixelId = facebookPixelId;
  }

  /**
   * Facebook Pixel Data Layer
   * trackByFacebookPixel()
   */
  trackByFacebookPixel(eventName: string, data: any = {}, eventId?: string): void {
    if (typeof (window as any).fbq !== 'undefined') {
      const options = eventId ? { eventID: eventId } : undefined;
      (window as any).fbq('track', eventName, data, options);

      // console.log(`📤 Pixel Sent: ${eventName}`, {
      //   data,
      //   eventID: eventId,
      // });
    } else {
      console.warn('⚠️ Facebook Pixel is not loaded yet.');
    }
  }

  // trackByFacebookPixel(eventName: string, data: any = {}): void {
  //   if (typeof (window as any).fbq !== 'undefined') {
  //     (window as any).fbq('track', eventName, data);
  //   } else {
  //     console.warn('⚠️ Facebook Pixel is not loaded yet.');
  //   }
  // }

  /**
   * Pushes event data to the dataLayer if running in the browser.
   * @param eventData The event data to be pushed to the dataLayer
   */
  pushToDataLayer(eventData: Record<string, any>): void {
    if (this.isBrowser) {
      window.dataLayer.push(eventData);
    }
  }

  /**
   * Server Side Tracking
   * @param data The page view data
   */
  trackPageView(data: GtmPageView) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-page-view`, data);
  }

  trackViewContent(data: GtmViewContent) {
    return this.http.post<any>(`${API_URL}/track-theme-view-content`, data);
  }

  trackAddToCart(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-add-to-cart`, data);
  }

  trackInitiateCheckout(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-initial-checkout`, data);
  }

  trackPurchase(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-purchase`, data);
  }

  /**
   * Tracks ecommerce event
   * @param data The ecommerce event data
   */
  trackEcommerceEvent(data: GtmViewContent) {
    return this.http.post<any>(`${API_URL}/track-ecommerce-event`, data);
  }
}
