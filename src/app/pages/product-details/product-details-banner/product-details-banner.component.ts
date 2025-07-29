import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ProductService} from "../../../services/common/product.service";
import {ReloadService} from "../../../services/core/reload.service";
import {UiService} from "../../../services/core/ui.service";

import {Product, VariationList} from "../../../interfaces/common/product.interface";
import {Wishlist} from "../../../interfaces/common/wishlist.interface";
import {WishlistService} from "../../../services/common/wishlist.service";
import {UserService} from "../../../services/common/user.service";
import {Subscription} from "rxjs";
import {Cart} from "../../../interfaces/common/cart.interface";
import {CartService} from "../../../services/common/cart.service";
import {isPlatformBrowser, NgClass, ViewportScroller} from "@angular/common";

import {Router, RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {StarRatingViewComponent} from "../../../shared/components/star-rating-view/star-rating-view.component";
import {ProductPricePipe} from "../../../shared/pipes/product-price.pipe";
import {FormsModule} from "@angular/forms";
import {MobileSliderComponent} from './mobile-slider/mobile-slider.component';
import {ImageLoadErrorDirective} from "../../../shared/directives/image-load-error.directive";
import {
  GalleryImageViewerComponent
} from "../../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {RequestProductComponent} from "../request-product/request-product.component";
import {UtilsService} from "../../../services/core/utils.service";
import {GtmService} from '../../../services/core/gtm.service';
import {AppConfigService} from "../../../services/core/app-config.service";
import {CurrencyCtrPipe} from "../../../shared/pipes/currency.pipe";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {PricePipe} from "../../../shared/pipes/price.pipe";

@Component({
  selector: 'app-product-details-banner',
  templateUrl: './product-details-banner.component.html',
  styleUrls: ['./product-details-banner.component.scss'],
  imports: [
    StarRatingViewComponent,
    ProductPricePipe,
    MobileSliderComponent,
    FormsModule,
    ImageLoadErrorDirective,
    NgClass,
    RouterLink,
    GalleryImageViewerComponent,
    RequestProductComponent,
    CurrencyCtrPipe,
    CurrencyCtrPipe,
    TranslatePipe,
  ],
  providers: [PricePipe],
  standalone: true
})
export class ProductDetailsBannerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('variationScroll') mainEl!: ElementRef;

  // Decorator
  @Input({required: true}) product: Product;
  @Input() shop: any;
  @Input({required: true}) productDetailsViews: any;
  @ViewChild('zoomViewer') zoomViewer: ElementRef;
  @ViewChild('featured', {static: false}) featured!: ElementRef;
  @ViewChild('lens', {static: false}) lens: ElementRef;
  allowedShopIds = ['6875f356618cd365fb91ada8'];
  @Input() chatLink:any;


  // Store Data
  cart: Cart | null = null;
  carts: Cart[] = [];
  wishlists: Wishlist[] = [];
  wishlist: Wishlist | undefined;
  productFixed = false;
  isModalVisible = false;
  isMobile: number = window.innerWidth;
  customWidth: number = 600;
  currencyCode: any;

  //Loader
  cartLoader: boolean = false;
  buyNowLoader: boolean = false;

  // Cart
  selectedQty: number = 1;

  // Variation Manage
  selectedVariation: string = null;
  selectedVariation2: string = null;
  selectedVariationList: VariationList = null;

  // Popup
  isReStockPopupOpen: boolean = false;
  showWholesale: boolean = false;
  // Image Control
  image: any;
  prevImage: any;
  zoomImage: string;
  private ratio: number = 3;
  selectedImage: string | null = null;
  transformStyle: string = 'translateX(0)';
  currentIndex: number = 0;
  slideWidth: number = 110;
  visibleImages: number = 3;
  private eventId: string;
  variationBorder: boolean = false;

  // Gallery
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;


  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '640w, 750w';

  // Inject Services
  private readonly appConfigService = inject(AppConfigService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly dialog = inject(MatDialog);
  private readonly utilsService = inject(UtilsService);
  private readonly gtmService = inject(GtmService);
  private readonly pricePipe = inject(PricePipe);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    // Wishlist
    const subscription = this.wishlistService.refreshStoredWishList$.subscribe(() => {
      this.wishlists = this.wishlistService.wishlistItems;
      this.checkWishlist();
    });
    this.subscriptions?.push(subscription);

    // Store Data
    this.wishlists = this.wishlistService.wishlistItems;
    this.checkWishlist();

    // Subscribe to sticky refresh event
    this.reloadService.refreshSticky$.subscribe((res) => {
      if (res) {
        this.onScrollSection();
      }
    });
  }


  ngOnChanges(changes: SimpleChanges) {
    if (this.product) {
      this.image = this.product?.images[0] || null;
      this.selectedImage = this.product?.images[0];
      this.zoomImage = this.image;


      // Set Default Variation
      if (this.product.isVariation) {
        // this.setDefaultVariation();
      }
    }
    if(this.productDetailsViews == 'ProductDetails 2'){
      this.customWidth = 0;
    }
  }

  isAllowedShop(): boolean {
    const id = this.shop;
    return !!id && this.allowedShopIds.includes(id);
  }


  /**
   * Variation Control
   * setDefaultVariation()
   * setSelectedVariationList()
   * onSelectVariation()
   * onSelectVariation2()
   * isStockAvailable()
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
    if(this.selectedVariationList?.name?.length>0){
      this.variationBorder = false;
    }
  }

  convertToLowercase(inputString: string): string {
    return inputString?.toLowerCase()?.trim();
  }

  onSelectVariation(name: string) {
    if (this.selectedVariation !== name) {
      this.selectedVariation = name;
      if (this.convertToLowercase(this.product?.variation) === "color" || this.convertToLowercase(this.product?.variation) === "colour" || this.convertToLowercase(this.product?.variation) === "version") {
        this.prevImage = this.image;
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
      }
      this.setSelectedVariationList();
    }
  }

  onSelectVariation2(name: string) {
    if (this.selectedVariation2 !== name) {
      this.selectedVariation2 = name;
      if (this.convertToLowercase(this.product?.variation2) === "color" || this.convertToLowercase(this.product?.variation2) === "colour" || this.convertToLowercase(this.product?.variation2) === "version") {
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
      }
      this.setSelectedVariationList();
    }
  }

  get isStockAvailable() {
    if (this.product?.isVariation) {
      if (this.selectedVariationList) {
        return this.selectedVariationList.quantity > 0;
      } else {
        return true;
      }
    } else {
      return this.product?.quantity > 0;
    }
  }

  getVariationImage(name: string): string | undefined {
    return this.product?.variationList.find(
      (v) => v?.name.toLowerCase().includes(name.toLowerCase())
    )?.image;
  }

  wholesaleQuantity(minimumWholesaleQuantity: any) {
    this.selectedQty = minimumWholesaleQuantity;
    this.showWholesale = true
  }

  retailQuantity(minimumWholesaleQuantity: any) {

    this.selectedQty = 1;
    this.showWholesale = false
  }

  /**
   * Cart Manage
   * onIncrementQtySimple()
   * onDecrementQtySimple()
   * onAddToCart()
   */

  onIncrementQtySimple(event?: MouseEvent, url?: string) {
    if (event) {
      event.stopPropagation();
    }

    if (this.showWholesale && this.product?.minimumWholesaleQuantity > 0) {

      if (this.selectedQty === this.product?.maximumWholesaleQuantity) {
        this.uiService.message(`Maximum quantity are ${this.product?.maximumWholesaleQuantity}`, "warn");
        return;
      }
      this.selectedQty += 1;
    } else {
      // if (this.selectedQty === 6) {
      //   this.uiService.message('Maximum quantity are 6', "warn");
      //   return;
      // }
      this.selectedQty += 1;
    }

  }

  onDecrementQtySimple(event: MouseEvent) {
    event.stopPropagation();

    if (this.showWholesale && this.product?.minimumWholesaleQuantity > 0) {
      if (this.selectedQty === this.product?.minimumWholesaleQuantity) {
        this.uiService.message(`Minimum quantity is ${this.product?.minimumWholesaleQuantity}`, "warn");
        return;
      }
      this.selectedQty -= 1;
    } else {
      if (this.selectedQty === 1) {
        this.uiService.message('Minimum quantity is 1', "warn");
        return;
      }
      this.selectedQty -= 1;
    }

  }

  onAddToCart(event: MouseEvent, type: 'addToCart' | 'buyNow') {
    event.stopPropagation();

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
      isWholesale: this.showWholesale,
      variation: this.selectedVariationList ? {
        _id: this.selectedVariationList?._id,
        name: this.selectedVariationList?.name,
        image: this.selectedVariationList?.image,
        option: getVariationOption(),
        sku: this.selectedVariationList?.sku,
      } : null
    };
    if (this.userService.isUser) {
      if (type === 'addToCart') {
        this.cartLoader = true;
      } else {
        this.buyNowLoader = true;
      }
      if(this.product?.isVariation && this.selectedVariationList?.name == null){
        // this.uiService.message('Please select the variation of this product.', "warn");
        this.variationBorder = true;
        this.reloadService.needRefreshSticky$(true);
        return;
      }else {
        this.addToCartDB(data, type);
      }
      // Event & Data Layer
      if (isPlatformBrowser(this.platformId)) {
        this.addToCartEvent();
      }
    } else {
      if(this.product?.isVariation && this.selectedVariationList?.name == null){
        // this.uiService.message('Please select the variation of this product.', "warn");
        this.variationBorder = true;
        this.reloadService.needRefreshSticky$(true);
        return;
      } else {
        this.cartService.addCartItemToLocalStorage(data);
        this.reloadService.needRefreshCart$(true);
      }
      // Event & Data Layer
      if (isPlatformBrowser(this.platformId)) {
        this.addToCartEvent();
      }
      if (type === 'addToCart') {
        this.cartLoader = true;
      } else {
        this.buyNowLoader = true;
      }

      if (type === 'addToCart') {
        this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
        this.cartLoader = false;
      }

      if (type === 'buyNow') {
        if(this.product?.isVariation && this.selectedVariationList?.name == null){
          return;
        }
        this.uiService.message('Success! Product added to your cart.', "success");

        this.router.navigate(['/checkout']).then();
        this.buyNowLoader = false;
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }


  /**
   * Wishlist Manage
   * onAddToWishlist()
   * checkWishlist()
   */
  onAddToWishlist(event: MouseEvent) {
    event.stopPropagation();
    if (this.wishlist) {
      this.deleteWishlistById(this.wishlist._id);
    } else {
      const data: Wishlist | any = {
        product: this.product?._id,
        selectedQty: 1,
      };
      if (this.userService.isUser) {
        this.addToWishlistDB(data, '');
        this.reloadService.needRefreshWishList$();
      } else {
        this.router.navigate(['/login']).then();
      }
    }
  }

  private checkWishlist() {
    this.wishlist = this.wishlists.find(f => (f.product as Product)?._id === this.product?._id);
  }

  /***
   * HOSTLISTENER FUNCTIONALITY
   */

  @HostListener('window:resize')
  onGetInnerWidth() {
    this.isMobile = window.innerWidth;

  }

  @HostListener('window:scroll')
  scrollBody() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the footer's Y offset position
      const [_, footerTop] = this.viewportScroller.getScrollPosition();
      const windowHeight = window.innerHeight;
      const footerOffsetTop = document.getElementById('footerSection')?.offsetTop || 0;

      if (window.scrollY > 200 && window.scrollY + windowHeight < footerOffsetTop) {
        this.productFixed = true;
      } else {
        this.productFixed = false;
      }
    }
  }
  /***
   * Scroll to the registration section smoothly
   */

  onScrollSection(): void {
    const el = this.mainEl.nativeElement as HTMLDivElement;
    // Define a breakpoint for mobile devices (adjust as needed)
    const isMobile = window?.matchMedia('(max-width: 768px)').matches;

    // Use 'nearest' for mobile and 'center' for larger screens
    const alignment = isMobile ? 'nearest' : 'center';

    el.scrollIntoView({
      behavior: 'smooth',
      inline: alignment,
      block: alignment
    });
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
          this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
          this.isModalVisible = false;
        }

        if (type === 'buyNow') {
          setTimeout(() => {
            this.buyNowLoader = false;
          }, 350);
          this.router.navigate(['/checkout'], {
            queryParams: {cart: res?.data?._id},
            queryParamsHandling: 'merge'
          }).then();
        }
        this.reloadService.needRefreshCart$(true);
      },
      error: (error) => {
        this.cartLoader = false;
        this.buyNowLoader = false;
        console.log(error);
      },
    });
    this.subscriptions?.push(subscription);
  }

  private addToWishlistDB(data: Wishlist, url?: string) {
    const subscription = this.wishlistService.addToWishlist(data)
      .subscribe({
        next: res => {
          this.uiService.actionMessage(res?.message, "success", '/my-wishlist', '', 'local_mall', 'View Wishlist', '');
          this.reloadService.needRefreshWishList$();
          if (url) {
            this.router.navigate([url]).then();
          }
        },
        error: error => console.error(error)
      });
    this.subscriptions?.push(subscription);
  }

  private deleteWishlistById(wishlistId: string) {
    const subscription = this.wishlistService.deleteWishlistById(wishlistId)
      .subscribe({
        next: res => {
          this.reloadService.needRefreshWishList$();
          this.uiService.actionMessage(res?.message, "success", '/my-wishlist', '', 'local_mall', 'View Wishlist', '');

        },
        error: error => console.error(error)
      });
    this.subscriptions?.push(subscription);
  }


  /**
   * Custom Popup
   * openReStockPopup()
   * onReStockPopupUpdated()
   */
  openReStockPopup() {
    this.isReStockPopupOpen = true;
  }

  onReStockPopupUpdated(data: any) {
    this.isReStockPopupOpen = data;
  }

  /**
   * Gallery View
   * openGallery()
   * closeGallery()
   */
  openGallery(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.isGalleryOpen = true;
    this.router.navigate([], {queryParams: {'gallery-image-view': true}, queryParamsHandling: 'merge'}).then();
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.router.navigate([], {queryParams: {'gallery-image-view': null}, queryParamsHandling: 'merge'}).then();
  }

  /**
   * Calculate
   * ratingCount()
   */
  get ratingCount(): number {
    if (this.product) {
      return Math.floor((this.product?.ratingTotal ?? 0) / (this.product?.ratingCount ?? 0));
    } else {
      return 0;
    }
  }

  /**
   * Image View and Control
   * selectImage()
   * hoverImage()
   * scrollLeft()
   * scrollRight()
   * updateTransform()
   * onMouseMove()
   * onMouseLeave()
   */

  public selectImage(data: any) {
    this.selectedImage = data;
    this.image = data;
    this.zoomImage = this.image;
  }

  hoverImage(image: string) {
    this.selectedImage = image;
    this.image = image;
    this.zoomImage = this.image;
  }

  scrollLeft() {
    if (this.product?.images.length === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateTransform();
    }
  }

  scrollRight() {
    if (this.product?.images.length === 0) return;
    if (this.currentIndex < this.product?.images.length - this.visibleImages) {
      this.currentIndex++;
      this.updateTransform();
    }
  }

  updateTransform() {
    this.transformStyle = `translateX(-${this.currentIndex * this.slideWidth}px)`;
  }


  public onMouseMove(e) {
    if (window.innerWidth >= 1099) {
      const image = e.currentTarget;
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      const x = offsetX / image.offsetWidth * 120;
      const y = offsetY / image.offsetHeight * 120;
      const zoom = this.zoomViewer.nativeElement;

      if (zoom) {
        // Apply transition for smooth zoom
        zoom.style.transition = 'transform 0.3s ease, width 0.3s ease, height 0.3s ease';

        zoom.style.transformOrigin = (x) + '% ' + (y) + '%';
        zoom.style.transform = 'scale(1.7)';
        zoom.style.display = 'block';
        zoom.style.height = `${image.height}px`;
        zoom.style.width = `${image.width + 0}px`;
        zoom.style.borderRadius = '5px';
      }
    }
  }


  public onMouseLeave(event) {
    var zoom = this.zoomViewer.nativeElement;
    if (zoom) {
      zoom.style.objectPosition = 'inherit';
      zoom.style.transform = 'scale(1)';
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const modalContent = document.querySelector('.modal-content') as HTMLElement;

    if (this.isModalVisible && modalContent && !modalContent.contains(event.target as Node)) {
      this.closeModal();
    }
  }


  /**
   * Utils
   * generateEventId()
   */
  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private addToCartEvent(): void {
    // 1️⃣ Generate Unique Event ID
    this.generateEventId();

    // 2️⃣ Hashed User Data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      lastName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare custom_data
    const custom_data = {
      content_ids: [this.product?._id],
      content_type: 'product',
      content_name: this.product?.name,
      content_category: this.product?.category?.name,
      content_subcategory: this.product?.subCategory?.name,
      value: (this.pricePipe.transform(this.product, 'salePrice')).toString(),
      currency: 'BDT',
      num_items: '1'
    };

    const eventTime  = Math.floor(Date.now() / 1000);
    const original_event_data = {
      event_name: 'AddToCart',
      event_time: eventTime,
    }

    // 4️⃣ Server-side Payload
    const trackData: any = {
      event_name: 'AddToCart',
      event_time: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && { user_data }),
    };

    // 5️⃣ Browser: Facebook Pixel Tracking (manual)
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('AddToCart', custom_data, this.eventId);

      this.gtmService.trackAddToCart(trackData).subscribe({
        next: () => {},
        error: () => {},
      });
    }

    // 6️⃣ Browser: GTM Push (if Pixel is managed via GTM)
    if (this.gtmService.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event: 'AddToCart',
        event_id: this.eventId,
        page_url: window.location.href,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        ecommerce: {
          add: {
            products: [
              {
                id: this.product?._id,
                name: this.product?.name,
                category: this.product?.category?.name,
                subcategory: this.product?.subCategory?.name,
                price: this.product?.regularPrice,
                currency: 'BDT',
                quantity: 1,
              }
            ],
            custom_data,
            original_event_data,
            ...(Object.keys(user_data).length > 0 && { user_data }),
          }
        }
      });
    }

  }



  getSocialLink(type: string): any {
    switch (type) {
      case 'messenger':
        return this.chatLink?.find(f => f.chatType === 'messenger') ?? null;
      case 'whatsapp':
        return this.chatLink?.find(f => f.chatType === 'whatsapp') ?? null;
      case 'phone':
        return this.chatLink?.find(f => f.chatType === 'phone') ?? null;
      default:
        return null;
    }
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }


}
