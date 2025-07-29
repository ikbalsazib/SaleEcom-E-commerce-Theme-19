import {Inject, inject, Injectable, PLATFORM_ID} from '@angular/core';
import {GtmViewContent} from "../../interfaces/core/gtm.interface";
import {Subscription} from "rxjs";
import {isPlatformBrowser} from "@angular/common";
import {GtmService} from "../core/gtm.service";

@Injectable({
  providedIn: 'root'  // This ensures the service is available app-wide
})
export class ViewContentService {
  private isBrowser: boolean;

  private readonly gtmService = inject(GtmService);
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && !window.dataLayer) {
      window.dataLayer = [];
    }
  }

  pushToDataLayer(eventData: any) {
    if (this.isBrowser) {
      window.dataLayer.push(eventData);
    }
  }

  /**
   * HTTP Req Handle
   * trackPageView()
   */

  trackViewContent(data: GtmViewContent) {
    const subscription = this.gtmService.trackViewContent(data)
      .subscribe({
        next: (res: any) => {
        },
        error: (err: any) => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  trackEcommerceEvent(data: GtmViewContent) {
    const subscription = this.gtmService.trackEcommerceEvent(data)
      .subscribe({
        next: (res: any) => {
        },
        error: (err: any) => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }
}
