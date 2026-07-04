import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UtilsService } from './utils.service';
import {
  TikTokCartItemInput,
  TikTokContentItem,
  TikTokEventPayload,
  TikTokOrderInput,
  TikTokProductInput,
  TrackTiktokEventDto
} from '../../interfaces/core/tiktok.interface';

const TIKTOK_API_URL = environment.apiBaseLink + '/api/tiktok';


@Injectable({ providedIn: 'root' })
export class TiktokPixelService {
  private initialized = false;
  private currentId: string | null = null;
  private lastPageViewUrl: string | null = null;
  private _shopId: string | null = null;
  private readonly apiBaseUrl = environment.apiBaseLink + '/api/tiktok';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private router: Router,
    private utilsService: UtilsService
  ) {}

  private get shopId(): string | null {
    if (this._shopId) return this._shopId;
    // Fallback: try to get from localStorage if AppConfigService hasn't pushed it yet
    if (this.isBrowser) {
      try {
        const config = JSON.parse(localStorage.getItem('themeConfig') || '{}');
        return config.shop || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize TikTok Pixel dynamically
   */
  init(pixelId: string | null, shopId: string | null = null) {
    if (shopId) this._shopId = shopId;
    if (!this.isBrowser || !pixelId) return;
    if (this.initialized && this.currentId === pixelId) return;

    this.ensureTtqLoaded(pixelId);
    this.initialized = true;
    this.currentId = pixelId;

    // Start listening for route changes for PageView tracking
    this.setupRouteChangeTracking();
  }

  private ensureTtqLoaded(pixelId: string) {
    const w: any = window;
    if (w.ttq) return;

    (function (w: any, d: Document, t: string, pid: string) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
        'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent',
        'revokeConsent', 'grantConsent'
      ];
      ttq.setAndDefer = function (tt: any, e: string) {
        tt[e] = function () {
          tt.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (id: string) {
        const inst = ttq._i[id] || [];
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(inst, ttq.methods[i]);
        }
        return inst;
      };
      ttq.load = function (id: string, config?: any) {
        const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = { ...config, autoPageView: false };
        const n = d.createElement('script');
        n.type = 'text/javascript';
        n.async = true;
        n.src = r + '?sdkid=' + id + '&lib=' + t;
        const s = d.getElementsByTagName('script')[0];
        s?.parentNode?.insertBefore(n, s);
      };

      ttq.load(pid, { autoPageView: false });
    })(w, this.document, 'ttq', pixelId);
  }

  /**
   * Listen to Router events for PageView
   */
  private setupRouteChangeTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      if (this.lastPageViewUrl !== url) {
        this.page();
        this.lastPageViewUrl = url;
      }
    });
  }

  /**
   * Helper Methods
   */
  getProductId(product: any): string {
    if (!product) return '';
    if (typeof product === 'string') return product;
    return product?._id || product?.id || product?.productId || '';
  }

  getProductName(product: any): string {
    if (!product || typeof product === 'string') return '';
    return product?.name || product?.content_name || '';
  }

  getProductCategory(product: any): string {
    if (!product || typeof product === 'string') return 'Uncategorized';
    if (typeof product?.category === 'object' && product?.category?.name) {
      return product.category.name;
    }
    return (product?.category as string) || (product?.content_category as string) || 'Uncategorized';
  }

  getProductPrice(product: any): number {
    if (!product || typeof product === 'string') return 0;
    const price = product?.salePrice || product?.price || product?.item_price || 0;
    return Number(price) || 0;
  }

  normalizeCurrency(): string {
    return 'BDT';
  }

  buildContents(items: any[]): TikTokContentItem[] {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => {
      const productObj = (item.product && typeof item.product === 'object') ? item.product : item;
      const qty = item.selectedQty || item.quantity || 1;
      return {
        content_id: this.getProductId(item.product || item),
        content_name: this.getProductName(productObj),
        content_category: this.getProductCategory(productObj),
        quantity: Number(qty) || 1,
        price: this.getProductPrice(productObj)
      };
    });
  }

  calculateNumItems(items: any[]): number {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (Number(item.selectedQty || item.quantity) || 1), 0);
  }

  generateEventId(eventName: string, entityId?: string): string {
    const timestamp = Date.now();
    if (entityId) {
      return `${eventName.toLowerCase()}_${entityId}_${timestamp}`;
    }
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `event_${timestamp}_${randomStr}`;
  }

  hasTrackedPurchase(orderId: string): boolean {
    if (!this.isBrowser) return false;
    try {
      const tracked = localStorage.getItem(`tt_tracked_order_${orderId}`);
      return tracked === 'true';
    } catch (e) {
      return false;
    }
  }

  markPurchaseTracked(orderId: string) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`tt_tracked_order_${orderId}`, 'true');
    } catch (e) {}
  }

  /**
   * E-commerce Funnel Events
   */

  page(eventId?: string): void {
    if (!this.isBrowser) return;
    const w: any = window;
    if (!w.ttq) return;

    const event_id = eventId || this.generateEventId('PageView');

    if (!environment.production) {
      console.log('TikTok PageView:', { event_id });
    }

    w.ttq.page({ event_id });
  }

  trackViewContent(product: TikTokProductInput, userData?: { email?: string; phoneNo?: string }) {
    if (!product) return;

    const contents = this.buildContents([product]);
    const payload: TikTokEventPayload = {
      content_ids: contents.map(c => c.content_id),
      content_type: 'product',
      content_name: this.getProductName(product),
      content_category: this.getProductCategory(product),
      contents: contents,
      value: this.getProductPrice(product),
      currency: this.normalizeCurrency(),
    };

    this.track('ViewContent', payload, this.generateEventId('ViewContent', product._id), userData);
  }

  trackAddToCart(product: TikTokProductInput, quantity: number = 1, userData?: { email?: string; phoneNo?: string }) {
    if (!product) return;

    const contents = this.buildContents([{ ...product, quantity }]);
    const payload: TikTokEventPayload = {
      content_ids: contents.map(c => c.content_id),
      content_type: 'product',
      content_name: this.getProductName(product),
      content_category: this.getProductCategory(product),
      contents: contents,
      quantity: Number(quantity) || 1,
      value: this.getProductPrice(product) * (Number(quantity) || 1),
      currency: this.normalizeCurrency(),
    };

    this.track('AddToCart', payload, this.generateEventId('AddToCart', product._id), userData);
  }

  trackInitiateCheckout(items: TikTokCartItemInput[], totalValue: number, userData?: { email?: string; phoneNo?: string }) {
    if (!items || items.length === 0) return;

    const contents = this.buildContents(items);
    const payload: TikTokEventPayload = {
      content_ids: contents.map(c => c.content_id),
      content_type: 'product',
      contents: contents,
      num_items: this.calculateNumItems(items),
      value: Number(totalValue) || 0,
      currency: this.normalizeCurrency(),
    };

    this.track('InitiateCheckout', payload, this.generateEventId('InitiateCheckout'), userData);
  }

  trackPurchase(order: TikTokOrderInput, eventId?: string) {
    if (!order || !order._id) return;

    const orderId = order.orderId || order._id;
    if (this.hasTrackedPurchase(orderId)) {
      if (!environment.production) console.log('TikTok Purchase already tracked for:', orderId);
      return;
    }

    const items = order.checkoutItems || order.orderedItems || [];
    const contents = this.buildContents(items);
    const payload: TikTokEventPayload = {
      content_ids: contents.map(c => c.content_id),
      content_type: 'product',
      contents: contents,
      num_items: this.calculateNumItems(items),
      value: Number(order.totalAmount || order.grandTotal) || 0,
      currency: this.normalizeCurrency(),
      order_id: orderId,
    };

    const eventIdToUse = eventId || this.generateEventId('Purchase', orderId);
    const userData = { email: order.email, phoneNo: order.phoneNo };

    this.track('Purchase', payload, eventIdToUse, userData);
    this.markPurchaseTracked(orderId);

    // Also track server side for reliability
    this.trackServerEvent({
      event: 'Purchase',
      eventId: eventIdToUse,
      value: payload.value,
      currency: payload.currency,
      contents: payload.contents,
      email: order.email,
      phoneNo: order.phoneNo,
      order_id: orderId
    });
  }

  /**
   * Core Track Method
   */
  track(eventName: string, data: TikTokEventPayload = {}, eventId?: string, userData?: { email?: string; phoneNo?: string }): void {
    if (!this.isBrowser) return;
    const w: any = window;
    if (!w.ttq) return;

    const finalEventId = eventId || data.event_id || this.generateEventId(eventName);

    // Create a copy to avoid mutating the original data
    const payload = { ...data, event_id: finalEventId };

    // Advanced Matching (Browser)
    const browserUserData: any = {};
    if (userData) {
      if (userData.email) {
        browserUserData.email = this.utilsService.hashDataSha256(userData.email);
      }
      if (userData.phoneNo) {
        const normalized = (userData.phoneNo + '').replace(/\D/g, '');
        browserUserData.phone_number = this.utilsService.hashDataSha256(normalized);
      }
    }

    if (Object.keys(browserUserData).length > 0) {
      w.ttq.identify(browserUserData);
    }

    if (!environment.production) {
      console.log(`TikTok Track [${eventName}]:`, payload);
    }

    w.ttq.track(eventName, payload);
  }

  /**
   * Get TikTok parameters (ttclid, ttp)
   */
  getTtclid(): string | undefined {
    if (!this.isBrowser) return undefined;
    const params = this.utilsService.getTiktokCookies();
    return params.ttclid;
  }

  getTtp(): string | undefined {
    if (!this.isBrowser) return undefined;
    const params = this.utilsService.getTiktokCookies();
    return params.ttp;
  }

  /**
   * Server Side Tracking (CAPI)
   */
  trackServerEvent(payload: TrackTiktokEventDto) {
    if (!this.shopId) {
      console.warn('[TikTok CAPI] Missing shopId, skipping server event.');
      return;
    }

    // Get TikTok params from cookies if not provided
    const tiktokParams = this.utilsService.getTiktokCookies();

    const finalPayload: TrackTiktokEventDto = {
      ...payload,
      ttp: payload.ttp || tiktokParams.ttp,
      ttclid: payload.ttclid || tiktokParams.ttclid,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    if (!environment.production) {
      console.log('TikTok CAPI Payload:', finalPayload);
    }

    const url = `${this.apiBaseUrl}/track-theme-event`;
    let params = new HttpParams();
    if (this.shopId) {
      params = params.set('shop', this.shopId);
    }

    this.http.post(url, finalPayload, { params }).subscribe({
      next: () => {
        if (!environment.production) console.log('TikTok CAPI Success');
      },
      error: (err) => {
        console.error('TikTok CAPI Error:', err);
      }
    });
  }
}
