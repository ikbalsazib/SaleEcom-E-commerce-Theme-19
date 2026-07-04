import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {OrderService} from '../../services/common/order.service';
import {Subscription} from 'rxjs';
import {Order} from '../../interfaces/common/order.interface';
import {AppConfigService} from '../../services/core/app-config.service';
import {GtmService} from '../../services/core/gtm.service';
import {isPlatformBrowser, UpperCasePipe} from '@angular/common';
import {UtilsService} from '../../services/core/utils.service';
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {ReloadService} from "../../services/core/reload.service";
import {SettingService} from "../../services/common/setting.service";
import {TiktokPixelService} from '../../services/core/tiktok-pixel.service';
import {UserService} from '../../services/common/user.service';
import {ProductPricePipe} from '../../shared/pipes/product-price.pipe';

@Component({
  selector: 'app-success-order',
  templateUrl: './success-order.component.html',
  styleUrls: ['./success-order.component.scss'],
  standalone: true,
  providers: [ProductPricePipe],
  imports: [
    RouterModule,
    UpperCasePipe,
    TranslatePipe,
  ]
})
export class SuccessOrderComponent implements OnInit, OnDestroy {

  // Store Data
  orderId: string;
  message: string;
  orderForm: string;
  order: Order;

  isEnableOrderSuccessPageOrderId: boolean = false;
  successPageMessage: any;
  private hasFiredPurchase = false;

  // Inject
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly utilsService = inject(UtilsService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly gtmService = inject(GtmService);
  private readonly tiktokPixelService = inject(TiktokPixelService);
  private readonly reloadService = inject(ReloadService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly settingService = inject(SettingService);
  private readonly userService = inject(UserService);
  private readonly productPricePipe = inject(ProductPricePipe);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subscription = this.activatedRoute.queryParamMap.subscribe(qParam => {
      this.orderId = qParam.get('orderId');
      this.message = qParam.get('message');
      this.orderForm = qParam.get('orderForm');
      if (this.isSuccessOrderPage && this.orderId) {
        this.getOrderByOrderId();
      }
    });
    this.subscriptions.push(subscription);

    this.getSetting();
  }


  /**
   * HTTP REQUEST HANDLE
   * getSetting()
   * getOrderByOrderId()
   */
  private getSetting() {
    const subscription = this.settingService.getSetting('orderSetting')
      .subscribe({
        next: res => {
          this.isEnableOrderSuccessPageOrderId = res.data?.orderSetting?.isEnableOrderSuccessPageOrderId;
          this.successPageMessage = res.data?.orderSetting?.successPageMessage;
        },
        error: err => {
          console.log(err);
        }
      });
    this.subscriptions.push(subscription);
  }
  private getOrderByOrderId(): void {
    const subscription = this.orderService.getOrderByOrderId(
      this.orderId,
      'orderId orderedItems grandTotal deliveryCharge phoneNo email name division shippingAddress createdAt'
    ).subscribe({
      next: (res) => {
        this.order = res.data;
        this.reloadService.needRefreshCart$(true);
        if (this.order && isPlatformBrowser(this.platformId) && this.isSuccessOrderPage) {
          this.purchaseEvent();
        }
      },
      error: (err) => {
        console.error('Error fetching order:', err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  public purchaseEvent(): void {
    if (!isPlatformBrowser(this.platformId) || !this.order || !Array.isArray(this.order.orderedItems) || !this.orderId) return;

    // Check if this specific order has already been tracked in this browser (dedup guard)
    const storageKey = `fbc_purchase_${this.orderId}`;
    if (localStorage.getItem(storageKey)) {
      console.log(`[CAPI Skip] Purchase event already fired for Order ID: ${this.orderId}`);
      return;
    }

    if (this.hasFiredPurchase) return;
    this.hasFiredPurchase = true;

    // 1️⃣ Generate Unique Event ID (use orderId for dedup between browser + server)
    const eId = this.order.orderId || this.orderId;

    // 2️⃣ Prepare user data & formatting helpers
    const cleanData = (data: any) => {
      let d = String(data || '').trim();
      if (!d || d.toLowerCase() === 'n/a' || d.toLowerCase() === 'outside-dhaka') return '';
      return d;
    };

    const firstName = this.order.name ? this.order.name.trim().split(' ')[0] : '';
    const lastName = this.order.name ? this.order.name.trim().split(' ').slice(1).join(' ') : '';
    const division = this.order['division']?.toLowerCase() === 'outside-dhaka' ? '' : (this.order['division'] ?? '');

    const formatExternalIdName = (name: string) => {
      const d = String(name || '').trim().toLowerCase();
      if (!d || d === 'n/a') return '';
      return d.charAt(0).toUpperCase() + d.slice(1);
    };

    const rawId = (
      formatExternalIdName(this.order.name) +
      cleanData(this.order.phoneNo) +
      cleanData(this.order.email) +
      cleanData(this.order['shippingAddress']) +
      cleanData(division)
    ).replace(/\s+/g, '');

    const externalIdRaw = rawId.charAt(0).toUpperCase() + rawId.slice(1).toLowerCase();

    const customer_information = {
      first_name: firstName,
      last_name: lastName,
      phone: this.order.phoneNo || '',
      email: this.order.email || '',
      address_1: this.order['shippingAddress'] || '',
      city: division || '',
      country: 'Bangladesh',
      country_code: 'BD'
    };

    const user_data = {
      ...this.utilsService.getUserData({
        firstName: firstName,
        lastName: lastName,
        email: this.order.email,
        phoneNo: this.order.phoneNo,
        external_id: externalIdRaw,
        city: division,
      }),
      external_id: this.utilsService.hashDataSha256(externalIdRaw)
    };

    const fbc = this.utilsService.getFbc();
    const fbp = this.utilsService.getFbp();

    const contents = this.order.orderedItems.map((m: any) => {
      const price = Number(m.salePrice ?? m.price ?? m.unitPrice ?? m.product?.salePrice ?? 0);
      return {
        id: String(m.product?._id || m._id),
        quantity: Number(m.quantity) || 1,
        item_price: price,
      };
    });

    // 3️⃣ Prepare custom_data (Strict Meta format for Pixel + CAPI)
    const custom_data = {
      content_ids: contents.map(c => c.id),
      contents,
      content_type: 'product',
      value: Number(this.order.grandTotal || 0),
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
      currency: "BDT",
      transaction_id: String(this.orderId),
      content_name: this.order.orderedItems.map((m: any) => m.name || m.product?.name).join(', '),
      content_category: this.order.orderedItems.map((m: any) => m.category?.name || m.product?.category?.name).filter(c => c).join(', '),
      shipping: Number(this.order['deliveryCharge'] || 0),
      fbp: fbp,
      fbc: fbc
    };

    const eventTime = Math.floor(Date.now() / 1000);
    const original_event_data = {
      event_name: 'Purchase',
      event_time: eventTime,
    };

    // 4️⃣ Meta CAPI Payload
    const trackData: any = {
      event_name: 'Purchase',
      event_time: eventTime,
      creationTime: eventTime,
      event_id: eId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      user_data,
      ...this.utilsService.getFbCookies()
    };

    // 5️⃣ Browser: Meta Pixel
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      console.log(`[Browser Pixel] Firing Purchase event. ID: ${eId}`);
      this.gtmService.trackByFacebookPixel('Purchase', custom_data, eId);
    }

    // 6️⃣ Server: Meta CAPI
    this.gtmService.trackPurchase(trackData).subscribe({
      next: () => {
        console.log(`[CAPI Success] Purchase tracked.`);
      },
      error: (err) => {
        console.error(`[CAPI Error] Purchase failed:`, err);
      },
    });

    // 7️⃣ Browser & Server: TikTok Tracking
    const analytics = this.appConfigService.getSettingData('analytics');
    if (analytics?.tiktokPixelId) {
      const userEmail = this.order?.email || this.userService.getUserLocalDataByField('email');
      const userPhone = this.order?.phoneNo || this.userService.getUserLocalDataByField('phoneNo');

      const tiktokBrowserData: any = {
        value: custom_data.value,
        currency: custom_data.currency,
        contents: contents.map((c) => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        email: userEmail,
        phone_number: userPhone
      };

      this.tiktokPixelService.track('CompletePayment', tiktokBrowserData, eId);

      this.tiktokPixelService.trackServerEvent({
        event: 'CompletePayment',
        eventId: eId,
        value: custom_data.value,
        currency: 'BDT',
        contents: contents.map((c) => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        email: userEmail,
        phoneNo: userPhone,
        ttclid: this.tiktokPixelService.getTtclid(),
        ttp: this.tiktokPixelService.getTtp(),
      });
    }

    // 8️⃣ GTM Data Layer (GA4 Standardized purchase)
    if (this.gtmService?.tagManagerId) {
      // Normalize BD phone for hashing (strip non-digits, ensure 880 prefix)
      const normalizeBdPhone = (raw?: string): string => {
        if (!raw) return '';
        let p = (raw + '').replace(/\D/g, '');
        if (p.startsWith('00')) p = p.slice(2);
        if (p.startsWith('880')) return p;
        if (p.startsWith('88')) return '880' + p.slice(2);
        if (p.startsWith('0') && p.length >= 11) return '880' + p.slice(1);
        return p;
      };

      this.gtmService.pushToDataLayer({
        event: 'purchase',
        action_source: 'website',
        order_id: String(this.orderId),
        event_id: String(this.orderId),
        external_id: externalIdRaw,
        ecommerce: {
          transaction_id: String(this.orderId),
          affiliation: "Website",
          value: Number(this.order.grandTotal || 0),
          currency: 'BDT',
          shipping: Number(this.order['deliveryCharge'] || 0),
          items: this.order.orderedItems.map((m: any) => ({
            item_id: String(m.product?._id || m._id),
            item_name: m.name || m.product?.name,
            item_category: m.category?.name || m.product?.category?.name,
            price: Number(m.salePrice ?? m.price ?? m.unitPrice ?? m.product?.salePrice ?? 0),
            quantity: Number(m.quantity) || 1
          }))
        },
        customer_information,
        user_data: [{
          external_id: this.utilsService.hashDataSha256(externalIdRaw),
          em: this.order.email ? this.utilsService.hashDataSha256(this.order.email) : '',
          ph: this.order.phoneNo ? this.utilsService.hashDataSha256(normalizeBdPhone(this.order.phoneNo)) : '',
          fn: firstName ? this.utilsService.hashDataSha256(this.utilsService.normText(firstName) || '') : '',
          ln: lastName ? this.utilsService.hashDataSha256(this.utilsService.normText(lastName) || '') : '',
          ct: division ? this.utilsService.hashDataSha256(this.utilsService.normText(division) || '') : '',
          country: this.utilsService.hashDataSha256('Bangladesh'),
          country_code: this.utilsService.hashDataSha256('BD')
        }]
      });
    }

    localStorage.setItem(storageKey, 'true');
  }


  get currentUrl() {
    return this.utilsService.removeUrlQuery(this.router.url);
  }

  get isSuccessOrderPage(): boolean {
    const url = this.currentUrl || '';
    return url === '/success-order' || url.includes('success-order');
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
