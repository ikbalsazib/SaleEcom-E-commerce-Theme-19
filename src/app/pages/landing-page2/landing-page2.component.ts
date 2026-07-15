import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ShopInformation } from "../../interfaces/common/shop-information.interface";
import { FixedLandingPageService } from "../../services/common/fixed-landing-page.service";
import { SettingService } from "../../services/common/setting.service";
import { ShopInformationService } from "../../services/common/shop-information.service";
import { UserService } from '../../services/common/user.service';
import { CanonicalService } from "../../services/core/canonical.service";
import { GtmService } from "../../services/core/gtm.service";
import { ReloadService } from "../../services/core/reload.service";
import { UtilsService } from "../../services/core/utils.service";
import { LazyLoadComponentDirective } from "../../shared/directives/lazy-load-component.directive";
import { PricePipe } from "../../shared/pipes/price.pipe";
import { ProductPricePipe } from "../../shared/pipes/product-price.pipe";
import { CustomerReviewComponent } from "./customer-review/customer-review.component";
import { FaqComponent } from './faq/faq.component';
import { FooterComponent } from './footer/footer.component';
import { HelpingComponent } from "./helping/helping.component";
import { OurProductComponent } from './our-product/our-product.component';
import { PaymentAreaComponent } from "./payment-area/payment-area.component";
import { SocialChatComponent } from "./social-chat/social-chat.component";
import { TopSectionComponent } from './top-section/top-section.component';
import { WhyBuyProductComponent } from "./why-buy-product/why-buy-product.component";
import { YoutubeVideoComponent } from "./youtube-video/youtube-video.component";

@Component({
  selector: 'app-landing-page2',
  templateUrl: './landing-page2.component.html',
  styleUrl: './landing-page2.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    TopSectionComponent,
    FaqComponent,
    OurProductComponent,
    FooterComponent,
    SocialChatComponent,
    LazyLoadComponentDirective,
    CommonModule,
    YoutubeVideoComponent,
    CustomerReviewComponent,
    HelpingComponent,
    WhyBuyProductComponent,
    PaymentAreaComponent,
  ],
  providers: [PricePipe, ProductPricePipe],
})
export class LandingPage2Component implements OnInit, OnDestroy {
  @ViewChild('payment') mainEl!: ElementRef;

  singleLandingPage: any;
  slug?: string;
  quantity = 1;
  private eventId: string;
  product: any;
  chatLink: any;
  showLazyComponent: string[] = [];
  selectedVariationList: any = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;
  carts: any[] = [];
  shopInfo: ShopInformation;
  websiteInfo: any;
  private hasFiredViewContent = false;
  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';

  // Array of shop IDs where footer should be hidden
  private readonly footerExcludedShopIds: string[] = ['679511745a429b7bb55421c4', '68948c6052ee077dd82580aa', '6868f0ab0d00ada7a9b37586', '6878c87616b1225e28ee5a1a'];

  // Inject
  private readonly landingPageService = inject(FixedLandingPageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly gtmService = inject(GtmService);
  private readonly utilsService = inject(UtilsService);
  private readonly settingService = inject(SettingService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly canonicalService = inject(CanonicalService);
  private readonly reloadService = inject(ReloadService);
  private readonly productPricePipe = inject(ProductPricePipe);
  private readonly shopInfoService = inject(ShopInformationService);
  private readonly userService = inject(UserService);
  private readonly pricePipe = inject(PricePipe);
  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Param Map
    const subscription = this.activateRoute.paramMap.subscribe((param) => {
      this.slug = param.get('slug');
      if (this.slug) {
        this.getOfferBySlug();
      }
    });

    this.subscriptions?.push(subscription);
    if (isPlatformBrowser(this.platformId)) {
      this.getChatLink();
      this.getShopInfo();
    }

    if (this.product?.isVariation) {
      this.setDefaultVariation();
    }

    this.reloadService.refreshSticky$.subscribe((res) => {
      if (res) {
        this.showLazyComponent = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6', 'sec7', 'sec8', 'sec9', 'sec10'];
        setTimeout(() => {
          this.onScrollSection();
        }, 50);
      }
    });


  }


  private getOfferBySlug() {
    const subscription = this.landingPageService
      .getLandingBySlug(this.slug)
      .subscribe({
        next: res => {
          this.singleLandingPage = res?.data;
          this.product = res?.data?.product;
          this.createCartFromLandingPage();
          this.updateMetaData();
          // View Content Event
          // if (isPlatformBrowser(this.platformId)) {
          //   this.viewContentEvent();
          // }
        },
        error: err => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  createCartFromLandingPage() {
    const product = this.singleLandingPage?.product;

    if (!product) return;

    const cartItem = {
      isSelected: true,
      product: product,
      quantity: this.quantity,
      selectedQty: this.quantity,
      variation: this.selectedVariationList
        ? {
          name: this.selectedVariationList.name,
          _id: this.selectedVariationList._id,
          sku: this.selectedVariationList.sku
        }
        : null,
    };

    this.carts = [cartItem];
  }

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

  /**
   * HTTP REQUEST CONTROLL
   * addNewsLetter()
   * getShopInfo()
   */

  private getShopInfo() {
    const subscription = this.shopInfoService.getShopInformation().subscribe({
      next: res => {
        this.shopInfo = res.data;
        this.websiteInfo = res.fShopDomain;
      },
      error: err => {
        console.error(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  // /**
  //  * Utils
  //  * generateEventId()
  //  */

  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private viewContentEvent(): void {
    if (!this.product?._id) return; // ✅ guard
    // 1️⃣ Generate Event ID
    this.generateEventId();
    // 2️⃣ Hashed user_data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      firstName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    const price = Number(this.pricePipe.transform(this.product, 'salePrice')) || 0;

    // 3️⃣ Prepare custom_data
    const custom_data = {
      contents: [{ id: String(this.product._id), quantity: 1, item_price: price }],
      content_type: 'product',
      content_name: this.product?.name,
      content_category: this.product?.category?.name,
      content_subcategory: this.product?.subCategory?.name,
      value: Number(price.toFixed(2)),
      currency: 'BDT',
      num_items: 1,
    };

    const eventTime = Math.floor(Date.now() / 1000);
    const page_url = location.href;
    const original_event_data = {
      event_name: 'ViewContent',
      event_time: eventTime,
    };

    // 4️⃣ Prepare server-side payload
    const viewContentData: any = {
      event_name: 'ViewContent',
      event_time: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: page_url,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && { user_data }),
    };

    // 5️⃣ Browser: Facebook Pixel
    if (
      this.gtmService.facebookPixelId &&
      !this.gtmService.isManageFbPixelByTagManager
    ) {
      this.gtmService.trackByFacebookPixel(
        'ViewContent',
        custom_data,
        this.eventId
      );
    }

    // 6️⃣ Server: Facebook Conversions API (CAPI) - Always fire if Pixel ID exists
    if (this.gtmService.facebookPixelId) {
      this.gtmService.trackViewContent(viewContentData).subscribe({
        next: () => {
        },
        error: () => {
        },
      });
    }

    // 6️⃣ Browser: GTM (if Pixel is managed by GTM)
    if (this.gtmService.tagManagerId) {
      // Push GA4 compatible event
      this.gtmService.pushToDataLayer({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: price,
          items: [
            {
              item_id: this.product?._id,
              item_name: this.product?.name,
              item_category: this.product?.category?.name,
              price: price,
              quantity: 1,
            },
          ],
        },
      });
    }
  }


  private getChatLink() {
    const subscription = this.settingService.getChatLink()
      .subscribe({
        next: (res) => {
          this.chatLink = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private setDefaultVariation() {
    if (this.product?.variation) {
      this.selectedVariation = this.product?.variationOptions[0];
    }
    if (this.product?.variation2) {
      this.selectedVariation2 = this.product?.variation2Options[0];
    }
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

  /**
   * updateMetaData()
   */

  private updateMetaData() {
    // Extract product information for reuse
    const seoTitle = this.singleLandingPage?.title;
    const seoDescription = this.singleLandingPage?.description;
    const imageUrl = this.singleLandingPage?.image; // Default to an empty string if no image is available
    const url = ``;
    // Title
    this.title.setTitle(seoTitle);

    // Meta Tags
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'theme-color', content: '#01640D' });
    this.meta.updateTag({ name: 'description', content: seoDescription });

    // Open Graph (og:)
    this.meta.updateTag({ property: 'og:title', content: seoTitle });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' }); // Recommended width
    this.meta.updateTag({ property: 'og:image:height', content: '630' }); // Recommended height
    this.meta.updateTag({ property: 'og:description', content: seoDescription });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // Twitter Tags
    this.meta.updateTag({ name: 'twitter:title', content: seoTitle });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:description', content: seoDescription });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl }); // Image for Twitter

    // Microsoft
    this.meta.updateTag({ name: 'msapplication-TileImage', content: imageUrl });

    // Canonical
    this.canonicalService.setCanonicalURL();
  }


  /**
   * ON Lazy Component Load
   */
  loadNextComponent(type: 'sec1' | 'sec2' | 'sec3' | 'sec4' | 'sec5' | 'sec6' | 'sec7' | 'sec8' | 'sec9' | 'sec10') {
    this.showLazyComponent.push(type);
  }

  checkComponentLoad(type: 'sec1' | 'sec2' | 'sec3' | 'sec4' | 'sec5' | 'sec6' | 'sec7' | 'sec8' | 'sec9' | 'sec10'): boolean {
    const fIndex = this.showLazyComponent.findIndex(f => f === type);
    return fIndex !== -1;
  }

  /**
   * Check if footer should be hidden for current shop
   */
  public shouldHideFooter(): boolean {
    if (!this.websiteInfo?._id) {
      return false;
    }

    const shopId = this.websiteInfo?._id.toString().trim();
    return this.footerExcludedShopIds.includes(shopId);
  }


  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalPageHeight = document.body.scrollHeight;
      const scrollThreshold = totalPageHeight * 0.6; // 60%

      if (scrollPosition >= scrollThreshold && !this.hasFiredViewContent) {
        this.viewContentEvent();
        this.hasFiredViewContent = true;
      }
    }
  }


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
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}

