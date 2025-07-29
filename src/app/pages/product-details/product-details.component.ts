import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Product} from '../../interfaces/common/product.interface';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductService} from '../../services/common/product.service';
import {FilterData} from "../../interfaces/core/filter-data";
import {Pagination} from "../../interfaces/core/pagination";
import {Category} from "../../interfaces/common/category.interface";
import {CategoryService} from "../../services/common/category.service";
import {BannerService} from "../../services/common/banner.service";
import {Banner} from '../../interfaces/common/banner.interface';
import {Meta, Title} from "@angular/platform-browser";
import {CanonicalService} from "../../services/core/canonical.service";
import {AppConfigService} from '../../services/core/app-config.service';
import {NewProductsCardComponent} from "../../shared/components/new-products-card/new-products-card.component";
import {
  ProductDetailsDescriptionComponent
} from "../../shared/components/product-details-description/product-details-description.component";
import {
  ProductDetailsAdditionalInfoComponent
} from "../../shared/components/product-details-additional-info/product-details-additional-info.component";
import {
  ProductsFilterCategoryComponent
} from "../../shared/components/products-filter-category/products-filter-category.component";
import {ProductsCardBannerComponent} from "../../shared/components/products-card-banner/products-card-banner.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  ProductDetailsLoaderComponent
} from "../../shared/loader/product-details-loader/product-details-loader.component";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {ProductDetailsBannerComponent} from "./product-details-banner/product-details-banner.component";
import {ProductDetailsReviewsComponent} from "./product-details-reviews/product-details-reviews.component";
import {UtilsService} from "../../services/core/utils.service";
import {UserService} from "../../services/common/user.service";
import {GtmService} from '../../services/core/gtm.service';
import {isPlatformBrowser} from '@angular/common';
import {ThemeViewSetting} from "../../interfaces/common/setting.interface";

import {Checkout2Component} from '../checkouts/checkout-2/checkout-2.component';
import {PricePipe} from "../../shared/pipes/price.pipe";
import {SettingService} from "../../services/common/setting.service";


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
  standalone: true,
  imports: [
    NewProductsCardComponent,
    ProductDetailsDescriptionComponent,
    ProductDetailsAdditionalInfoComponent,
    ProductsFilterCategoryComponent,
    ProductsCardBannerComponent,
    FormsModule,
    ReactiveFormsModule,
    ProductDetailsLoaderComponent,
    MatBottomSheetModule,
    ProductDetailsBannerComponent,
    ProductDetailsReviewsComponent,
    Checkout2Component,
  ],
  providers: [PricePipe]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  // Theme Settings
  themeColors: any;
  shop: any;
  productDetailsViews: string;

  // Store Data
  slug?: string;
  product: Product;
  chatLink: any;
  categories: Category [] = [];
  relatedProducts: Product[] = [];
  banners: Banner[] = [];
  currentTab: string = 'description';
  private eventId: string;
  productSetting: any;  //for one page checkout, added later

  // Loading
  isLoading: boolean = true;
  isBannerLoading: boolean = false;
  isLoadingRelatedProducts: boolean = false;


  // Inject
  private readonly appConfigService = inject(AppConfigService);
  private readonly categoryService = inject(CategoryService);
  private readonly bannerService = inject(BannerService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly utilsService = inject(UtilsService);
  private readonly gtmService = inject(GtmService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly productService = inject(ProductService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly pricePipe = inject(PricePipe);
  private readonly settingService = inject(SettingService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base
    this.getSettingData();

    // Param Map
    const subscription = this.activateRoute.paramMap.subscribe((param) => {
      this.slug = param.get('slug');
      if (this.slug) {
        this.getProductBySlug();
      }
    });
    this.subscriptions?.push(subscription);

    // Query Param Map
    const subscription2 = this.activateRoute.queryParamMap.subscribe(qParam => {
      if (qParam.get('tab')) {
        this.currentTab = qParam.get('tab');
      }
    });
    this.subscriptions?.push(subscription2);

    // Base Data
    this.getAllCategory();
    this.getAllBanners();
    if (isPlatformBrowser(this.platformId)) {
      this.getChatLink();
    }
    // NEW CODE: Get productSetting from AppConfigService instead of API
    this.productSetting = this.appConfigService.getSettingData('productSetting');
  }

  /**
   * Initial Landing Page Setting
   * getSettingData()
   */

  private getSettingData() {
    this.themeColors = this.appConfigService.getSettingData('themeColors');
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.productDetailsViews = themeViewSettings.find(f => f?.type == 'productDetailsViews')?.value.join();
    this.shop = this.appConfigService.getSettingData('shop');
  }

  /**
   * HTTP Request Handle
   * getProductBySlug()
   * getRelatedProducts()
   * getAllCategory()
   * getAllBanners()
   */
  private getProductBySlug() {
    const subscription = this.productService
      .getProductBySlug(this.slug)
      .subscribe({
        next: res => {
          this.product = res.data;
          if (this.product) {
            this.getRelatedProducts();
            // View Content Event
            if (isPlatformBrowser(this.platformId)) {
              this.viewContentEvent();
              this.updateMetaData();
            }

          }
          this.isLoading = false;
        },
        error: err => {
          console.log(err);
          this.isLoading = false;
        },
      });
    this.subscriptions?.push(subscription);
  }

  private getRelatedProducts() {
    this.isLoadingRelatedProducts = true;
    const pagination: Pagination = {
      pageSize: 5,
      currentPage: 0
    };
    const mSelect = {
      _id: 1,
      name: 1,
      isVariation: 1,
      images: 1,
      prices: 1,
      tags: 1,
      slug: 1,
      salePrice: 1,
      totalSold: 1,
      discountType: 1,
      variationList: 1,
      discountAmount: 1,
      minimumWholesaleQuantity: 1,
      wholesalePrice: 1,
    }
    const filterData: FilterData = {
      pagination: pagination,
      filter: {
        'category._id': this.product?.category?._id,
        status: 'publish'
      },
      select: mSelect,
      sort: {createdAt: 1}
    }
    const subscription = this.productService.getAllProducts(filterData, null)
      .subscribe({
        next: res => {
          if (res.data && res.data.length) {
            this.relatedProducts = res.data.filter(f => f._id !== this.product?._id);
          }
          this.isLoadingRelatedProducts = false;
        },
        error: error => {
          this.isLoadingRelatedProducts = false;
          console.log(error);
        }
      });
    this.subscriptions?.push(subscription);
  }

  private getAllCategory() {
    const subscription = this.categoryService.getAllCategory().subscribe({
      next: res => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: err => {
        console.log(err);
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }

  private getAllBanners() {
    let mSelect = {
      name: 1,
      slug: 1,
      images: 1,
      mobileImage: 1,
      type: 1,
      url: 1,
    }
    const filterData: FilterData = {
      filter: {type: 'product-details-banner'},
      select: mSelect,
      sort: null,
      pagination: {
        pageSize: 2,
        currentPage: 0
      }
    }
    this.isBannerLoading = true;
    const subscription = this.bannerService.getAllBanner(filterData, null)
      .subscribe({
        next: res => {
          this.banners = res.data;
          this.isBannerLoading = false;
        },
        error: err => {
          this.isBannerLoading = false;
        }
      });
    this.subscriptions?.push(subscription);
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

  /**
   * Utils
   * generateEventId()
   */
  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private viewContentEvent(): void {
    // 1️⃣ Generate Event ID
    this.generateEventId();
    // 2️⃣ Hashed user_data
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

    const eventTime = Math.floor(Date.now() / 1000);
    const page_url = location.href;
    const original_event_data = {
      event_name: 'ViewContent',
      event_time: eventTime,
    }

    // 4️⃣ Prepare server-side payload
    const viewContentData: any = {
      event_name: 'ViewContent',
      event_time: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && {user_data}),
    };

    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('ViewContent', custom_data, this.eventId);
      // 7️⃣ Server: Send to Facebook Conversions API
      this.gtmService.trackViewContent(viewContentData).subscribe({
        next: () => {
        },
        error: () => {
        },
      });
    }

    // 6️⃣ Browser: GTM (if Pixel is managed by GTM)
    if (this.gtmService.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event: 'ViewContent',
        event_id: this.eventId,
        page_url: window.location.href,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        ecommerce: {
          detail: {
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
            ...(Object.keys(user_data).length > 0 && {user_data}),
          }
        }
      });
    }
  }


  /**
   * updateMetaData()
   */

  private updateMetaData() {
    const seoTitle = this.product?.seoTitle || this.product?.name;
    const seoDescription = this.product?.seoDescription || this.product?.name;
    const seoKeywords = this.product?.seoKeyword || ''; // Example: "organic honey, pure honey, raw honey"
    const imageUrl = this.product?.images?.[0] || '';
    const url = window.location.href;

    // Title
    this.title.setTitle(seoTitle);

    // Meta Tags
    this.meta.updateTag({name: 'robots', content: 'index, follow'});
    this.meta.updateTag({name: 'theme-color', content: this.themeColors?.primary});
    this.meta.updateTag({name: 'description', content: seoDescription});
    this.meta.updateTag({name: 'keywords', content: seoKeywords}); // ✅ Keywords added

    // Open Graph
    this.meta.updateTag({property: 'og:title', content: seoTitle});
    this.meta.updateTag({property: 'og:type', content: 'website'});
    this.meta.updateTag({property: 'og:url', content: url});
    this.meta.updateTag({property: 'og:image', content: imageUrl});
    this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
    this.meta.updateTag({property: 'og:image:width', content: '1200'});
    this.meta.updateTag({property: 'og:image:height', content: '630'});
    this.meta.updateTag({property: 'og:description', content: seoDescription});
    this.meta.updateTag({property: 'og:locale', content: 'en_US'});

    // Twitter Tags
    this.meta.updateTag({name: 'twitter:title', content: seoTitle});
    this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
    this.meta.updateTag({name: 'twitter:description', content: seoDescription});
    this.meta.updateTag({name: 'twitter:image', content: imageUrl});

    // Microsoft
    this.meta.updateTag({name: 'msapplication-TileImage', content: imageUrl});

    // Canonical
    this.canonicalService.setCanonicalURL();
  }


  /**
   * UI Logic
   * toggleTab()
   */
  toggleTab(name: string) {
    this.router.navigate([], {queryParams: {tab: name}, queryParamsHandling: ''}).then();
  }

  /**
   * ON Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
