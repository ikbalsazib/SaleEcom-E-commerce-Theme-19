import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GtmPageView, GtmViewContent } from '../../interfaces/core/gtm.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { PixelService } from './pixel.service';

const API_URL = environment.apiBaseLink + '/api/gtag';

declare global {
  interface Window {
    dataLayer: Array<any>;
    ttq?: any;
    fbq?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private _isManageFbPixelByTagManager: boolean = false;
  private _facebookPixelId: string;
  private _tagManagerId: string;
  private readonly isBrowser: boolean;
  private readonly http = inject(HttpClient);
  private readonly pixelService = inject(PixelService);

  private getShopParams(): HttpParams {
    return new HttpParams().set('shop', this.getShopId());
  }

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
    if (typeof window === 'undefined') return;

    if (this._facebookPixelId) {
      this.pixelService.init(this._facebookPixelId);
    }

    const w: any = window;

    // 1. Ensure fbq is defined as a stub if not already (safeguard)
    if (!w.fbq) {
      (function (f: any, b: Document, e: string, v: string, n?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      })(window, document, 'script', '');
    }

    // 2. Deduplication: Map eventId to eventID for Meta Pixel
    const opts = eventId ? { eventID: eventId } : undefined;

    // 3. Resilience: Wrap in try-catch to prevent site crashes
    try {
      w.fbq('track', eventName, data, opts);
    } catch (e) {
      console.error('🔴 [Browser Pixel] Error firing event:', e);
    }
  }

  /**
   * TikTok Pixel
   * trackByTiktokPixel()
   * Uses same eventId for browser + server deduplication
   */
  trackByTiktokPixel(eventName: string, data: any = {}, eventId?: string): void {
    if (typeof window === 'undefined') return;

    const w: any = window;
    const payload: any = { ...data };
    if (eventId) {
      // TikTok deduplication key
      payload.event_id = eventId;
    }

    // If ttq is ready, fire immediately
    if (w.ttq && typeof w.ttq.track === 'function') {
      w.ttq.track(eventName, payload);
    } else {
      // If not ready, queue it or wait for ready
      if (w.ttq && typeof w.ttq.ready === 'function') {
        w.ttq.ready(() => {
          w.ttq.track(eventName, payload);
        });
      } else {
        // Fallback: queue in ttq array if it exists
        if (w.ttq && Array.isArray(w.ttq)) {
          w.ttq.push(['track', eventName, payload]);
        }
      }
    }
  }


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
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-page-view`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (!res.success) console.warn('🔴 Server CAPI PageView:', res.message);
      })
    );
  }

  trackViewContent(data: GtmViewContent) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-view-content`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (!res.success) console.warn('🔴 Server CAPI ViewContent:', res.message);
        else console.log('%c[CAPI Success] ViewContent Event tracked on server', 'color: #00ff00; font-weight: bold;', res.data);
      })
    );
  }

  trackAddToCart(data: any) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-add-to-cart`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (!res.success) console.warn('🔴 Server CAPI AddToCart:', res.message);
        else console.log('%c[CAPI Success] AddToCart Event tracked on server', 'color: #00ff00; font-weight: bold;', res.data);
      })
    );
  }

  trackInitiateCheckout(data: any) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-initial-checkout`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (!res.success) console.warn('🔴 Server CAPI InitiateCheckout:', res.message);
        else console.log('%c[CAPI Success] InitiateCheckout Event tracked on server', 'color: #00ff00; font-weight: bold;', res.data);
      })
    );
  }

  trackPurchase(data: any) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-purchase`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (!res.success) console.warn('🔴 Server CAPI Purchase:', res.message);
        else console.log('%c[CAPI Success] Purchase Event tracked on server', 'color: #00ff00; font-weight: bold;', res.data);
      })
    );
  }

  /**
   * Tracks ecommerce event
   * @param data The ecommerce event data
   */
  trackEcommerceEvent(data: GtmViewContent) {
    return this.http.post<any>(`${API_URL}/track-ecommerce-event`, data, { params: this.getShopParams() }).pipe(
      tap(res => {
        if (res.success) console.log('%c[CAPI Success] Ecommerce Event tracked on server', 'color: #00ff00; font-weight: bold;', res.data);
      })
    );
  }

  private getShopId(): string {
    if (this.isBrowser) {
      const config = localStorage.getItem('themeConfig');
      if (config) {
        try {
          return JSON.parse(config).shop || '';
        } catch (e) {
          return '';
        }
      }
    }
    return '';
  }

  /**
   * TikTok Events API
   * Server-side tracking with shared event_id
   */
  trackTiktokEvent(data: any) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-tt-event`, data);
  }
}
