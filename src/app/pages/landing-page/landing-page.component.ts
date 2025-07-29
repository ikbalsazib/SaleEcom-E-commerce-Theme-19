import {Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, NgForm} from "@angular/forms";
import {Cart} from "../../interfaces/common/cart.interface";
import {CART_MAX_QUANTITY} from "../../core/utils/app-data";
import {User, UserAddress} from "../../interfaces/common/user.interface";
import {DeliveryCharge, Setting} from "../../interfaces/common/setting.interface";
import {DOCUMENT, isPlatformBrowser, NgStyle} from "@angular/common";
import {CartService} from "../../services/common/cart.service";
import {OrderService} from "../../services/common/order.service";
import {ReloadService} from "../../services/core/reload.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserDataService} from "../../services/common/user-data.service";
import {UiService} from "../../services/core/ui.service";
import {ProductPricePipe} from "../../shared/pipes/product-price.pipe";
import {UserService} from "../../services/common/user.service";
import {LandingPageService} from "../../services/common/landing-page.service";
import {Subscription} from "rxjs";
import {SafeHtmlCustomPipe} from "../../shared/pipes/safe-html.pipe";
import {CurrencyCtrPipe} from '../../shared/pipes/currency.pipe';
import {DeliveryCharge2Component} from "./delivery-charge-2/delivery-charge-2.component";
import {SeoPageService} from "../../services/common/seo-page.service";
import {Meta, Title} from "@angular/platform-browser";
import {CanonicalService} from "../../services/core/canonical.service";
import {OfferAddressComponent} from "./offer-address/offer-address.component";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  standalone: true,
  providers: [ProductPricePipe],
  imports: [
    FormsModule,
    ProductPricePipe,
    SafeHtmlCustomPipe,
    NgStyle,
    CurrencyCtrPipe,
    DeliveryCharge2Component,
    OfferAddressComponent,
    TranslatePipe
  ]
})
export class LandingPageComponent implements OnInit, OnDestroy {

  // Decorator
  @ViewChild('formElement') formElement: NgForm;

  // Data Form
  dataForm?: FormGroup;
  needRefreshForm: boolean = false;

  // Store Data
  division: string;
  carts: Cart[] = [];
  readonly cartMaxQuantity: number = CART_MAX_QUANTITY;
  user: User;
  setting: Setting;
  deliveryCharge: DeliveryCharge;
  deliveryChargeAmount: number = 0;
  shippingAddress: any;
  selectedPaymentProvider= 'Cash on Delivery';
  note: string;
  userLandingDiscount: any;
  singleLandingPage: any;
  slug?: string;

  // Theme Settings
  themeColors: any;
  seoPageData: any;

  // Loading
  isLoading: boolean = false;

  // Inject
  private readonly document = inject(DOCUMENT);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);
  private readonly userDataService = inject(UserDataService);
  private readonly uiService = inject(UiService);
  private readonly productPricePipe = inject(ProductPricePipe);
  protected readonly userService = inject(UserService);
  private readonly landingPageService = inject(LandingPageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly seoPageService = inject(SeoPageService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);


  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
// Param Map
    const subscription = this.activateRoute.paramMap.subscribe((param) => {
      this.slug = param.get('slug');
      if (this.slug) {
        this.getLandingBySlug();
      }
    });
    this.subscriptions?.push(subscription);

    // Base Data
    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }
    this.getAllSeoPage();
  }

  /**
   * HTTP Req Handle
   * getLandingBySlug()
   * getLoggedInUserData()
   * updateCartQty()
   * addOrder()
   */


  private getLandingBySlug() {
    const subscription = this.landingPageService
      .getLandingBySlug(this.slug)
      .subscribe({
        next: res => {
          this.singleLandingPage = res?.data;
          const mData =[{
            isSelected: true,
            product: this.singleLandingPage?.product,
            selectedQty: 1,
            variation:null
          }];
          this.carts = mData;
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
              this.checkBackgroundChange(this.singleLandingPage?.background);
            }, 100)

          }
        },
        error: err => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private getLoggedInUserData() {
    const select = 'email name phoneNo';
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

  public updateCartQty(cartId: string, data: any) {
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
    this.updateDeliveryChargeAmount();
  }

  private addOrder(data: any) {
    this.isLoading = true;
    const subscription = this.orderService.addOrder(data, false).subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoading = false;
          switch (res.data.providerName) {
            case 'Cash on Delivery': {
              this.uiService.message(res.message, 'success');
              if (!this.userService.isUser) {
                this.cartService.deleteAllCartFromLocal(true);
              }
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

  private getAllSeoPage() {
    const subscription = this.seoPageService.getAllSeoPageByUi({status: 'publish', 'type': 'landing-page'}, 1, 1).subscribe({
      next: (res) => {
        this.seoPageData = res.data[0];
        if (isPlatformBrowser(this.platformId)) {
          this.updateMetaData();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions.push(subscription);
  }


  /**
   * updateMetaData()
   */

  private updateMetaData() {
    // Extract product information for reuse
    const seoTitle = this.seoPageData?.seoTitle ? this.seoPageData?.seoTitle : 'Landing Page';
    const seoDescription = this.seoPageData?.seoDescription ? this.seoPageData?.seoDescription : this.seoPageData?.name;
    const imageUrl = this.seoPageData?.images ? this.seoPageData?.images[0] : ''; // Default to an empty string if no image is available
    const seoKeywords = this.seoPageData?.seoKeyword || ''; // Example: "organic honey, pure honey, raw honey"
    const url = window.location.href;

    // Title
    this.title.setTitle(seoTitle);

    // Meta Tags
    this.meta.updateTag({name: 'robots', content: 'index, follow'});
    this.meta.updateTag({name: 'theme-color', content: this.themeColors?.primary});
    this.meta.updateTag({name: 'description', content: seoDescription});
    this.meta.updateTag({ name: 'keywords', content: seoKeywords });

    // Open Graph (og:)
    this.meta.updateTag({property: 'og:title', content: seoTitle});
    this.meta.updateTag({property: 'og:type', content: 'website'});
    this.meta.updateTag({property: 'og:url', content: url});
    this.meta.updateTag({property: 'og:image', content: imageUrl});
    this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
    this.meta.updateTag({property: 'og:image:width', content: '1200'}); // Recommended width
    this.meta.updateTag({property: 'og:image:height', content: '630'}); // Recommended height
    this.meta.updateTag({property: 'og:description', content: seoDescription});
    this.meta.updateTag({property: 'og:locale', content: 'en_US'});

    // Twitter Tags
    this.meta.updateTag({name: 'twitter:title', content: seoTitle});
    this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
    this.meta.updateTag({name: 'twitter:description', content: seoDescription});
    this.meta.updateTag({name: 'twitter:image', content: imageUrl}); // Image for Twitter

    // Microsoft
    this.meta.updateTag({name: 'msapplication-TileImage', content: imageUrl});

    // Canonical
    this.canonicalService.setCanonicalURL();
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


    if (!this.shippingAddress || (this.shippingAddress && !this.shippingAddress.division)) {
      this.needRefreshForm = true;
      this.uiService.message('Please select your address', "warn")
      return;
    }

    const getCartOrProductIds = () => {
      return this.carts.map(m => m.product['_id']);
    }

    const cartData = () => {
      // if (this.userService.isUser) {
      //   return [];
      // }
      // else {

        return this.carts.map(m => {
          return {
            ...m,
            ...{
              product: m.product['_id']
            }
          }
        })
      // }
    }

    const data: any = {
      user: null,
      orderType: 'anonymous',
      carts: getCartOrProductIds(),
      cartData: cartData(),
      name: this.shippingAddress.name,
      phoneNo: this.shippingAddress.phoneNo,
      shippingAddress: this.shippingAddress.shippingAddress,
      division: this.shippingAddress.division,
      area: this.shippingAddress.area,
      zone: this.shippingAddress.zone,
      orderFrom: 'Landing Page',
      addressType: this.shippingAddress?.addressType,
      email: this.user?.email ?? null,
      providerName: this.selectedPaymentProvider,
      note: this.note,
      deliveryType: this.deliveryCharge?.type,
      userLanding: this.userLandingDiscount?.landingType,
      needSaveAddress: true,
    }

    this.addOrder(data);
  }


  /**
   * ON Change Methods
   * onChangeAddress()
   * onChangeDeliveryCharge()
   * onChangePaymentMethod()
   * onChangeUserDiscount()
   */
  onChangeAddress(event: UserAddress) {
    this.shippingAddress = event;
    this.division = this.shippingAddress.city;
  }

  onChangeDeliveryCharge(event: DeliveryCharge) {
    this.deliveryCharge = event;
    // this.deliveryChargeAmount = event.deliveryCharge ?? 0;
    this.updateDeliveryChargeAmount();
  }

  updateDeliveryChargeAmount() {
    this.deliveryChargeAmount =
      this.deliveryCharge?.freeDeliveryMinAmount && this.cartSaleSubTotal >= this.deliveryCharge.freeDeliveryMinAmount
        ? 0
        : this.deliveryCharge?.deliveryCharge ?? 0;
  }

  /**
   * Cart Methods
   * onIncrementQty()
   * onDecrementQty()
   */
  onIncrementQty(index: number) {
    if (!this.carts || !this.carts[index]) {
      // console.error(`Invalid index or carts array. Index: ${index}`, this.carts);
      return;
    }
    const maxQuantity = this.cartMaxQuantity || 10;
    const cartItem = this.carts[index];
    if (cartItem.selectedQty < maxQuantity) {
      cartItem.selectedQty += 1;
    } else {
      this.uiService.message(`Maximum quantity is ${maxQuantity}`, 'warn');
    }

    this.updateDeliveryChargeAmount();
  }

  onDecrementQty(index: number) {
    if (!this.carts || !this.carts[index]) {
      // console.error(`Invalid index or carts array. Index: ${index}`, this.carts);
      return;
    }
    const minQuantity = 1; // Minimum quantity (typically 1, or you can adjust it as needed)
    const cartItem = this.carts[index];

    if (cartItem.selectedQty > minQuantity) {
      cartItem.selectedQty -= 1;
    } else {
      this.uiService.message('Cannot decrease quantity below 1', 'warn');
    }

    this.updateDeliveryChargeAmount();
  }

  /**
   * Calculation
   * cartSaleSubTotal()
   * grandTotal()
   */

  get cartSaleSubTotal(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'salePrice',
        item.variation?._id,
        item.selectedQty
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get grandTotal(): number {
    return this.cartSaleSubTotal + (this.deliveryChargeAmount ?? 0) - (this.userLandingDiscount?.amount ?? 0);
  }

  // Function to check for background change
  checkBackgroundChange(newData) {
    const savedBackground = localStorage.getItem('OFFER_PAGE_BG');
    if (savedBackground && savedBackground !== newData?.background) {
      localStorage.setItem('OFFER_PAGE_BG', newData?.background);
    } else if (!savedBackground) {
      localStorage.setItem('OFFER_PAGE_BG', newData?.background);
    } else {
    }
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
