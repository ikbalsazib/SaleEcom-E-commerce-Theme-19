import {Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, NgForm} from "@angular/forms";
import {Cart} from "../../../interfaces/common/cart.interface";
import {User, UserAddress} from "../../../interfaces/common/user.interface";
import {Subscription} from "rxjs";
import {CartService} from "../../../services/common/cart.service";
import {OrderService} from "../../../services/common/order.service";
import {UiService} from "../../../services/core/ui.service";
import {ReloadService} from "../../../services/core/reload.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {UserDataService} from "../../../services/common/user-data.service";
import {DOCUMENT, isPlatformBrowser} from "@angular/common";
import {CART_MAX_QUANTITY} from '../../../core/utils/app-data';
import {ProductPricePipe} from '../../../shared/pipes/product-price.pipe';
import {DeliveryCharge, Setting} from '../../../interfaces/common/setting.interface';
import {UserService} from '../../../services/common/user.service';
import {AppConfigService} from '../../../services/core/app-config.service';
import {GtmService} from '../../../services/core/gtm.service';
import {TiktokPixelService} from '../../../services/core/tiktok-pixel.service';
import {UtilsService} from '../../../services/core/utils.service';
import {TitleComponent} from "../../../shared/components/title/title.component";
import {CouponCardComponent} from "../../../shared/components/coupon-card/coupon-card.component";
import {OrderItemCardComponent} from "../../../shared/components/order-item-card/order-item-card.component";
import {
  OrderItemCardMobileComponent
} from "../../../shared/components/order-item-card-mobile/order-item-card-mobile.component";
import {OrderLoaderComponent} from "../../../shared/loader/order-loader/order-loader.component";
import {MatInput} from "@angular/material/input";
import {ProductCardLoaderComponent} from "../../../shared/loader/product-card-loader/product-card-loader.component";
import {PaymentCardLoaderComponent} from "../../../shared/loader/payment-card-loader/payment-card-loader.component";
import {PaymentMethodComponent} from "../components/payment-method/payment-method.component";
import {CouponsComponent} from "../components/coupons/coupons.component";
import {AddressArea1Component} from "./address-area-1/address-area-1.component";
import {DeliveryCharge1Component} from "./delivery-charge-1/delivery-charge-1.component";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout-1.component.html',
  styleUrl: './checkout-1.component.scss',
  providers: [ProductPricePipe],
  standalone: true,
  imports: [
    TitleComponent,
    FormsModule,
    CouponCardComponent,
    OrderItemCardComponent,
    OrderItemCardMobileComponent,
    OrderLoaderComponent,
    MatInput,
    ProductCardLoaderComponent,
    PaymentCardLoaderComponent,
    PaymentMethodComponent,
    CouponsComponent,
    AddressArea1Component,
    DeliveryCharge1Component,
    RouterLink,
    CurrencyCtrPipe
  ]
})
export class Checkout1Component implements OnInit, OnDestroy {

  // Data Form
  dataForm?: FormGroup;
  @ViewChild('formElement') formElement: NgForm;

  // Store Data
  carts: Cart[] = [];
  readonly cartMaxQuantity: number = CART_MAX_QUANTITY;
  selectedCartItem: string = null;
  user: User;
  setting: Setting;
  deliveryCharge: DeliveryCharge;
  deliveryChargeAmount: number = 0;
  shippingAddress: UserAddress;
  selectedPaymentProvider: string;
  note: string;

  // Loading
  isLoading: boolean = false;

  // Tracking
  private eventId: string;
  private hasInitiatedCheckout = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Inject
  private readonly document = inject(DOCUMENT);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userDataService = inject(UserDataService);
  private readonly uiService = inject(UiService);
  private readonly productPricePipe = inject(ProductPricePipe);
  private readonly userService = inject(UserService);
  private readonly gtmService = inject(GtmService);
  private readonly utilsService = inject(UtilsService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly tiktokPixelService = inject(TiktokPixelService);
  private readonly platformId = inject(PLATFORM_ID);


  ngOnInit() {

    // Cart Data
    const subscription = this.reloadService.refreshCart$.subscribe(isRefresh => {
      if (isRefresh) {
        this.getCartsItems();
      }
    });
    this.subscriptions?.push(subscription);
    this.carts = this.cartService.cartItems;

    this.getCartsItems();


    this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam.get('cart')) {
        this.selectedCartItem = qParam.get('cart');
      }
    });

    // Base Data
    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }

    // Initiate Checkout Tracking
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initiateCheckoutEvent();
      }, 500);
    }
  }


  /**
   * Utils
   * generateEventId()
   * initiateCheckoutEvent()
   */
  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private initiateCheckoutEvent(): void {
    if (this.hasInitiatedCheckout || !this.carts?.length) return;
    this.hasInitiatedCheckout = true;

    // 1️⃣ Generate Unique Event ID
    this.generateEventId();

    // 2️⃣ Get hashed user data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      firstName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare contents (variation-aware via ProductPricePipe)
    const contents = this.carts.map((c) => ({
      id: String((c.product as any)['_id']),
      quantity: Number(c.selectedQty ?? 1),
      item_price: Number(
        this.productPricePipe.transform(
          c.product,
          'salePrice',
          c.variation?._id,
          1,
          c?.isWholesale
        ) || (c.product as any)['salePrice'] || (c.product as any)['currentPrice'] || 0
      ),
    }));

    const fbc = this.utilsService.getFbc();
    const fbp = this.utilsService.getFbp();

    // 4️⃣ Prepare custom_data
    const custom_data = {
      content_ids: contents.map(c => c.id),
      contents,
      content_type: 'product',
      value: Number(this.grandTotal ?? 0),
      currency: 'BDT',
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
      content_name: this.carts.map(c => (c.product as any)['name']).join(', '),
      content_category: this.carts.map(c => (c.product as any)['category']?.['name']).filter(c => c).join(', '),
      shipping: Number(this.deliveryChargeAmount || this.deliveryCharge?.deliveryCharge || 0),
      fbp: fbp,
      fbc: fbc,
    };

    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;

    const eventTime = Math.floor(Date.now() / 1000);
    const original_event_data = {
      event_name: 'InitiateCheckout',
      event_time: eventTime,
    };

    // 5️⃣ Server-side payload for Meta CAPI
    const trackData: any = {
      event_name: 'InitiateCheckout',
      event_time: eventTime,
      creationTime: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && { user_data }),
    };

    // 6️⃣ Browser: Facebook Pixel
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      console.log(`[Browser Pixel] Firing InitiateCheckout event. ID: ${this.eventId}`);
      this.gtmService.trackByFacebookPixel('InitiateCheckout', custom_data, this.eventId);
    } else {
      console.log(`[Browser Pixel] InitiateCheckout Skipped. PixelID: ${this.gtmService.facebookPixelId}, ManagedByGTM: ${this.gtmService.isManageFbPixelByTagManager}`);
    }

    // 7️⃣ Server: Meta Conversions API
    this.gtmService.trackInitiateCheckout(trackData).subscribe({
      next: () => { console.log(`[CAPI Success] InitiateCheckout tracked.`); },
      error: (err) => { console.error(`[CAPI Error] InitiateCheckout failed:`, err); },
    });

    // 8️⃣ Browser: GTM dataLayer push (GA4 begin_checkout)
    if (this.gtmService?.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BDT',
          value: Number(this.grandTotal ?? 0),
          items: this.carts.map((c) => ({
            item_id: (c.product as any)['_id'],
            item_name: (c.product as any)['name'],
            item_category: (c.product as any)['category']?.['name'],
            price: Number(
              this.productPricePipe.transform(c.product, 'salePrice', c.variation?._id, 1, c?.isWholesale) || 0
            ),
            quantity: Number(c.selectedQty) || 1,
          })),
        },
      });
    }

    // 9️⃣ TikTok: Browser + Server
    const analytics = this.appConfigService.getSettingData('analytics');
    if (analytics?.tiktokPixelId) {
      const userEmail = this.userService.getUserLocalDataByField('email');
      const userPhone = this.userService.getUserLocalDataByField('phoneNo');

      const tiktokBrowserData: any = {
        value: custom_data.value,
        currency: custom_data.currency,
        contents: contents.map(c => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        num_items: custom_data.num_items,
      };

      if (userEmail) tiktokBrowserData.email = userEmail;
      if (userPhone) tiktokBrowserData.phone_number = userPhone;

      // Browser-side TikTok Pixel
      this.tiktokPixelService.track('InitiateCheckout', tiktokBrowserData, this.eventId);

      // Server-side TikTok Events API
      this.tiktokPixelService.trackServerEvent({
        event: 'InitiateCheckout',
        eventId: this.eventId,
        value: custom_data.value,
        currency: custom_data.currency,
        contents: contents.map(c => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        email: userEmail,
        phoneNo: userPhone,
        externalId: this.userService.getUserLocalDataByField('userId'),
        ttclid: this.tiktokPixelService.getTtclid(),
        ttp: this.tiktokPixelService.getTtp(),
      });
    }
  }


  /**
   * HTTP Req Handle
   * getLoggedInUserData()
   * getPaymentMethod()
   * getCartsItems()
   * updateCartQty()
   */
  private getLoggedInUserData() {
    const select = 'email';
    const subscription = this.userDataService.getLoggedInUserData(select)
      .subscribe({
        next: (res) => {
          this.user = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }


  private getCartsItems() {
    const subscription = this.cartService.getCartByUser()
      .subscribe({
        next: res => {
          this.carts = res.data;
          this.cartService.updateCartList(this.carts);
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }

  private updateCartQty(cartId: string, data: any) {
    const subscription = this.cartService.updateCartQty(cartId, data).subscribe({
      next: res => {
        if (res.success) {
          this.reloadService.needRefreshCart$(true);
        }
      },
      error: err => {
        console.log(err)
      }
    });
    this.subscriptions?.push(subscription);
  }

  private addOrder(data: any) {
    this.isLoading = true;
    const subscription = this.orderService.addOrder(data, this.userService.isUser).subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoading = false;
          switch (res.data.providerName) {
            case 'Cash on Delivery': {
              this.uiService.message(res.message, 'success');
              this.router.navigate(['/success-order'], {
                queryParams: {orderId: res.data.orderId},
              }).then();

              this.cartService.needRefreshStoredCart$();
              break;
            }
            case 'Bkash': {
              if (res.success && res.data.link) {
                this.document.location.href = res.data.link;
              } else {
                this.uiService.message(res.message, 'wrong');
              }
              break;
            }
            case 'SSl Commerz': {
              if (res.success && res.data.link) {
                this.document.location.href = res.data.link;
              } else {
                this.uiService.message(res.message, 'wrong');
              }
              break;
            }
          }
        } else {
          this.uiService.message(res.message, 'warn');
        }

      },
      error: (error) => {
        console.log(error);
      },
    });
    this.subscriptions?.push(subscription);
  }


  /**
   * UI Methods
   * onConfirmOrder()
   */
  public onConfirmOrder() {

    if (!this.carts.length) {
      this.uiService.message('Empty Cart! sorry your cart is empty.', "warn");
      this.router.navigate(['/']).then();
      return;
    }

    if (!this.selectedPaymentProvider) {
      this.uiService.message('Please select a payment method', "warn")
      return;
    }

    if (!this.shippingAddress) {
      this.uiService.message('Please select your address', "warn")
      return;
    }

    const data: any = {
      orderType: this.userService.isUser ? 'user' : 'anonymous',
      carts: this.carts.map(m => m._id),
      name: this.shippingAddress.name,
      phoneNo: this.shippingAddress.phoneNo,
      shippingAddress: this.shippingAddress.shippingAddress,
      division: this.shippingAddress.division,
      area: this.shippingAddress.area,
      zone: this.shippingAddress.zone,
      addressType: this.shippingAddress.addressType,
      email: this.user.email ?? null,
      providerName: this.selectedPaymentProvider,
      note: this.note,
      deliveryType: this.deliveryCharge?.type,
    }

    this.addOrder(data);
  }



  /**
   * ON Change Methods
   * onChangeAddress()
   * onChangeDeliveryCharge()
   * onChangePaymentMethod()
   */
  onChangeAddress(event: UserAddress) {
    this.shippingAddress = event;
  }

  onChangeDeliveryCharge(event: DeliveryCharge) {
    this.deliveryCharge = event;
    this.deliveryChargeAmount = event.deliveryCharge ?? 0;
  }

  onChangePaymentMethod(event: any) {
    this.selectedPaymentProvider = event;
  }

  /**
   * Cart Methods
   * onIncrementQty()
   * onDecrementQty()
   */
  onIncrementQty(cartId: string) {
    const index = this.carts.findIndex(f => f._id === cartId);
    if (this.carts[index].selectedQty === this.cartMaxQuantity) {
      this.uiService.message(`Maximum product quantity is ${this.cartMaxQuantity}`, 'warn');
    } else {
      this.carts[index].selectedQty += 1;
      this.updateCartQty(cartId, {selectedQty: 1, type: 'increment'});
    }
  }

  onDecrementQty(cartId: string) {
    const index = this.carts.findIndex(f => f._id === cartId);
    if (this.carts[index].selectedQty === 1) {
      this.uiService.message('Minimum quantity is 1', 'warn');
    } else {
      this.carts[index].selectedQty -= 1;
      this.updateCartQty(cartId, {selectedQty: 1, type: 'decrement'});
    }
  }

  /**
   * Calculation
   * cartRegularSubTotal()
   * cartSaleSubTotal()
   * cartDiscountAmount()
   */

  get cartRegularSubTotal(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'regularPrice',
        item.variation?._id,
        item.selectedQty
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get cartSaleSubTotal(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'salePrice',
        item.variation?._id,
        item.selectedQty,
        item?.isWholesale
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get cartDiscountAmount(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'discountAmount',
        item.variation?._id,
        item.selectedQty,
        item?.isWholesale
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get grandTotal(): number {
    return this.cartSaleSubTotal + (this.deliveryChargeAmount ?? 0)
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
