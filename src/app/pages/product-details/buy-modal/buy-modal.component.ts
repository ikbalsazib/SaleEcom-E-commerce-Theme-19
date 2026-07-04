import {Component, Inject, Input, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {PricePipe} from "../../../shared/pipes/price.pipe";
import {VariationList} from "../../../interfaces/common/product.interface";
import {UiService} from "../../../services/core/ui.service";
import {ReloadService} from "../../../services/core/reload.service";
import {Router} from "@angular/router";
import {UserService} from "../../../services/common/user.service";
import {CartService} from "../../../services/common/cart.service";
import {Cart} from "../../../interfaces/common/cart.interface";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {ProductPricePipe} from "../../../shared/pipes/product-price.pipe";
import {MatIcon} from "@angular/material/icon";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {TiktokPixelService} from "../../../services/core/tiktok-pixel.service";
import {GtmService} from "../../../services/core/gtm.service";
import {UtilsService} from "../../../services/core/utils.service";
import {AppConfigService} from "../../../services/core/app-config.service";

@Component({
  selector: 'app-buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.scss'],
  standalone: true,
  providers: [PricePipe, ProductPricePipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ProductPricePipe,
    ImageLoadErrorDirective,
    MatIcon,
    CurrencyCtrPipe,
    TranslatePipe,
  ]
})
export class BuyModalComponent  implements OnInit {
  @Input() product:  any = null;
  @Input() cart:  any = null;
  indexNumber = 0;
  selectedQty: number = 1;
  // Store Data
  selectedVariationList: VariationList = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;
  image: any;
  zoomImage: any;
  prevImage:any;
  //Loader
  cartLoader: boolean = false;
  buyNowLoader: boolean = false;
  isModalVisible = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];


  constructor(
    // private modal: ModalController,
    private bottomSheetRef: MatBottomSheetRef<BuyModalComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private uiService: UiService,
    private reloadService: ReloadService,
    private router: Router,
    private userService: UserService,
    private cartService: CartService,
    private tiktokPixelService: TiktokPixelService,
    private gtmService: GtmService,
    private utilsService: UtilsService,
    private appConfigService: AppConfigService,
    private productPricePipe: ProductPricePipe,
  ) { }

  private eventId: string;

  ngOnInit() {
    this.product = this.data.product;
    this.setDefaultImage();
    if (this.product.isVariation) {
      this.setDefaultVariation();
    }
  }

  onIncrementQtySimple(event?: MouseEvent, url?: string) {
    if (event) {
      event.stopPropagation();
    }
    // if (this.selectedQty === 6) {
    //   this.uiService.message('Maximum quantity are 6',"warn");
    //   return;
    // }
    this.selectedQty += 1;
  }

  onDecrementQtySimple(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedQty === 1) {
      this.uiService.message('Minimum quantity is 1',"warn");
      return;
    }
    this.selectedQty -= 1;
  }
  /**
    MODAL HANDLE METHOD
   * onCloseModal()
   */

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  private setDefaultImage() {
    this.image =
      this.product?.images && this.product?.images.length > 0
        ? this.product?.images[0]
        : 'https://cdn.saleecom.com/upload/images/placeholder.png';
    this.zoomImage = this.image;
  }

  getVariationImage(name: string): string | undefined {
    return this.product?.variationList.find(
      (v) => v?.name.toLowerCase().includes(name.toLowerCase())
    )?.image;
  }
  /**
   * Variation Functions
   * onSelectVariation()
   * onSelectVariation2()
   */
  private setDefaultVariation() {
    if (this.product?.variation) {
      this.selectedVariation = this.product?.variationOptions[0];
    }
    if (this.product?.variation2) {
      this.selectedVariation2 = this.product?.variation2Options[0];
    }
    // Selected Variation List
    this.setSelectedVariationList();

  }

  private setSelectedVariationList() {
    if (this.selectedVariation && this.selectedVariation2) {
      this.selectedVariationList = this.product?.variationList.find(
        f => f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    } else {
      this.selectedVariationList = this.product?.variationList.find(f => f.name === `${this.selectedVariation}`)
    }
  }

  onSelectVariation(name: string) {
    if (this.selectedVariation !== name) {
      this.selectedVariation = name;
      if(this.convertToLowercase(this.product?.variation) === "color" || this.convertToLowercase(this.product?.variation) === "colour"){
        this.prevImage = this.image;
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
        }
      // this.prevImage = this.image;
      // let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
      // this.image = image && image.length > 0 ? image : this.prevImage;
      this.setSelectedVariationList();
    }
  }

  onSelectVariation2(name: string) {
    if (this.selectedVariation2 !== name) {
      this.selectedVariation2 = name;
      if(this.convertToLowercase(this.product?.variation2) === "color" || this.convertToLowercase(this.product?.variation2) === "colour"){
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
      }
      // let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
      // this.image = image && image.length > 0 ? image : this.prevImage;
      this.setSelectedVariationList();
    }
  }

  convertToLowercase(inputString: string): string {
    return inputString?.toLowerCase()?.trim();
  }

  onAddToCart(event: MouseEvent, type: 'addToCart' | 'buyNow') {
    event.stopPropagation();
    this.addToCartEvent();
    const getVariationOption = () => {
      if (this.product?.variation && this.product.variation2) {
        return `${this.product?.variation}, ${this.product.variation2}`
      } else {
        return `${this.product?.variation}`
      }
    }

    const data: Cart = {
      product: this.product?._id,
      selectedQty: this.selectedQty,
      isSelected: true,
      variation: this.selectedVariationList ? {
        _id: this.selectedVariationList?._id,
        name: this.selectedVariationList?.name,
        image: this.selectedVariationList?.image,
        option: getVariationOption(),
        sku: this.selectedVariationList?.sku,
      } : null
    };
    if (this.userService.isUser) {
      if(type === 'addToCart'){
        this.cartLoader = true;
      }else{
        this.buyNowLoader = true;
      }
      this.addToCartDB(data, type);
    } else {
      this.cartService.addCartItemToLocalStorage(data);
      this.reloadService.needRefreshCart$(true);
      if(type === 'addToCart'){
        this.cartLoader = true;
      }else{
        this.buyNowLoader = true;
      }
      if (type === 'addToCart') {
        this.dismiss();
        this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout' , 'local_mall', 'View Cart','Buy Now');
        this.cartLoader = false;
      }

      if (type === 'buyNow') {
        this.dismiss();
        this.router.navigate(['/checkout']).then();
        this.buyNowLoader = false;
      }
    }
  }

  /**
   * HTTP Req Handle
   * addToCartDB()
   * addToWishlistDB()
   * deleteWishlistById()
   */
  private addToCartDB(data: Cart, type: 'addToCart' | 'buyNow') {
    const subscription = this.cartService.addToCart(data).subscribe({
      next: res => {
        if (type === 'addToCart') {
          setTimeout(() => {
            this.cartLoader = false;
          }, 350);
          this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout' , 'local_mall', 'View Cart','Buy Now');
          this.isModalVisible = false;
          this.dismiss();
        }
        this.reloadService.needRefreshCart$(true);
        if (type === 'buyNow') {
          setTimeout(() => {
            this.buyNowLoader = false;
          }, 350);
          this.dismiss();
          this.router.navigate(['/checkout'], {
            queryParams: {cart: res?.data?._id},
            queryParamsHandling: 'merge'
          }).then();
          this.bottomSheetRef.dismiss();
        }
      },
      error: (error) => {
        this.cartLoader = false;
        this.buyNowLoader = false;
        console.log(error);
      },
    });
    this.subscriptions?.push(subscription);
  }

  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private addToCartEvent(): void {
    if (!this.product) return;

    const qty = Number(this.selectedQty);
    const unitPrice =
      Number(this.productPricePipe.transform(this.product, 'salePrice', this.selectedVariationList?._id, 1)) ||
      Number(this.product?.regularPrice) ||
      0;

    if (!unitPrice) return;

    // 1️⃣ Generate Unique Event ID
    this.generateEventId();

    // 2️⃣ Hashed User Data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      firstName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    const contents = [{ id: String(this.product?._id), quantity: qty, item_price: unitPrice }];

    // 3️⃣ Prepare custom_data
    const custom_data = {
      contents,
      content_ids: [String(this.product?._id)],
      content_name: this.product?.name,
      content_category: (this.product?.category as any)?.name || '',
      content_type: 'product',
      value: Number((unitPrice * qty).toFixed(2)),
      currency: 'BDT',
      num_items: qty,
      shipping: 0,
      ...this.utilsService.getFbCookies(),
    };

    const eventTime = Math.floor(Date.now() / 1000);
    const original_event_data = { event_name: 'AddToCart', event_time: eventTime };

    // 4️⃣ Server-side Payload (Meta CAPI)
    const trackData: any = {
      event_name: 'AddToCart',
      event_time: eventTime,
      creationTime: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      user_data,
      ...this.utilsService.getFbCookies()
    };

    // 5️⃣ Browser: Facebook Pixel
    if (
      this.gtmService.facebookPixelId &&
      !this.gtmService.isManageFbPixelByTagManager
    ) {
      console.log(`[Browser Pixel] Firing AddToCart event. ID: ${this.eventId}`);
      this.gtmService.trackByFacebookPixel(
        'AddToCart',
        custom_data,
        this.eventId
      );
    }

    this.gtmService.trackAddToCart(trackData).subscribe({
      next: () => {},
      error: () => {},
    });

    // 6️⃣ Browser: GTM Data Layer Push (GA4 Format)
    if (this.gtmService.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value: custom_data.value,
          items: [{
            item_id: this.product?._id,
            item_name: this.product?.name,
            item_category: (this.product?.category as any)?.name || '',
            price: unitPrice,
            quantity: qty,
          }],
        }
      });
    }

    // 7️⃣ TikTok Pixel
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
        content_name: custom_data.content_name,
        content_category: custom_data.content_category,
      };

      if (userEmail) tiktokBrowserData.email = userEmail;
      if (userPhone) tiktokBrowserData.phone_number = userPhone;

      this.tiktokPixelService.track('AddToCart', tiktokBrowserData, this.eventId);

      this.tiktokPixelService.trackServerEvent({
        event: 'AddToCart',
        eventId: this.eventId,
        value: custom_data.value,
        currency: custom_data.currency,
        contents: tiktokBrowserData.contents,
        email: userEmail,
        phoneNo: userPhone,
        ttclid: this.tiktokPixelService.getTtclid(),
        ttp: this.tiktokPixelService.getTtp(),
      });
    }
  }
}

