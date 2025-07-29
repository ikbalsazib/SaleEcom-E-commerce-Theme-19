import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TagService} from '../../services/common/tag.service';
import {AppConfigService} from '../../services/core/app-config.service';
import {Router} from "@angular/router";
import {Meta, Title} from "@angular/platform-browser";
import {CanonicalService} from "../../services/core/canonical.service";
import {Subscription} from 'rxjs';
import {StorageService} from "../../services/core/storage.service";
import {Popup} from "../../interfaces/common/popup.interface";
import {PopupService} from "../../services/common/popup.service";
import {isPlatformBrowser} from '@angular/common';
import {PopupDialogComponent} from '../../shared/dialog/popup-dialog/popup-dialog.component';
import {ThemeViewSetting} from '../../interfaces/common/setting.interface';
import {Showcase2Component} from "./showcases/showcase-2/showcase-2.component";
import {TimeCounterModule} from "../../shared/components/time-counter/time-counter.module";
import {Showcase3Component} from "./showcases/showcase-3/showcase-3.component";
import {CategoriesComponent} from "./categories/categories.component";
import {TagProductsComponent} from "./tag-products/tag-products.component";
import {ShopInformation} from "../../interfaces/common/shop-information.interface";
import {ShopInformationService} from "../../services/common/shop-information.service";
import {Banner1Component} from "./all-banner/banner-1/banner-1.component";
import {SeoPageService} from "../../services/common/seo-page.service";
import {FooterXl2Component} from "../../shared/components/core/footer/footer-xl/footer-xl-2/footer-xl-2.component";
import {FooterXl1Component} from "../../shared/components/core/footer/footer-xl/footer-xl-1/footer-xl-1.component";
import {FooterXl3Component} from "../../shared/components/core/footer/footer-xl/footer-xl-3/footer-xl-3.component";
import {BlogComponent} from "./blog/blog.component";
import {FooterXl4Component} from "../../shared/components/core/footer/footer-xl/footer-xl-4/footer-xl-4.component";
import {RecentOrderComponent} from "./recent-order/recent-order.component";
import {SettingService} from "../../services/common/setting.service";
import {Showcase4Component} from "./showcases/showcase-4/showcase-4.component";
import {FooterXl5Component} from "../../shared/components/core/footer/footer-xl/footer-xl-5/footer-xl-5.component";
import {BrandsComponent} from "./brands/brands.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [
    Showcase2Component,
    TimeCounterModule,
    Showcase3Component,
    CategoriesComponent,
    TagProductsComponent,
    Banner1Component,
    FooterXl2Component,
    FooterXl1Component,
    FooterXl3Component,
    BlogComponent,
    FooterXl4Component,
    RecentOrderComponent,
    Showcase4Component,
    FooterXl5Component,
    BrandsComponent,
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  // Store data
  isTagProduct: boolean
  popup: Popup;
  tags: any[] = [];
  shopInfo: ShopInformation;

  // Theme Settings
  showcaseViews: string;
  productViews: string;
  themeColors: any;
  seoPageData: any;
  isEnableHomeRecentOrder: any;
  isEnableBlog: any;
  footerViews: string;

  // Inject
  private readonly appConfigService = inject(AppConfigService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly storageService = inject(StorageService);
  private readonly popupService = inject(PopupService);
  private readonly tagService = inject(TagService);
  private readonly seoPageService = inject(SeoPageService);
  private readonly dialog = inject(MatDialog);
  private readonly shopInfoService = inject(ShopInformationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly settingService = inject(SettingService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Theme Settings
    this.getSettingData();

    if (this.isTagProduct) {
      this.getAllTags();
    }
    this.popupView();
    if (isPlatformBrowser(this.platformId)) {
      // this.updateMetaData();
      this.getShopInfo();
    }
    this.getAllSeoPage();
    this.getSetting();
  }

  /**
   * Initial Landing Page Setting
   * getSettingData()
   */

  private getSettingData() {
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.productViews = themeViewSettings.find(f => f.type == 'productViews')?.value?.join();
    this.showcaseViews = themeViewSettings.find(f => f.type == 'showcaseViews')?.value?.join();
    this.themeColors = this.appConfigService.getSettingData('themeColors');
    this.isTagProduct = this.productViews.split(',').includes('Tag');
    this.footerViews = themeViewSettings.find(f => f.type === 'footerViews')?.value?.join() || '';

  }


  /**
   * Footer
   * getShopInfo()
   */
  private getShopInfo() {
    setTimeout(() => {
      const subscription = this.shopInfoService.getShopInformation().subscribe({
        next: res => {
          this.shopInfo = res.data;
        },
        error: err => {
          console.error(err);
        }
      });
      this.subscriptions?.push(subscription);
    }, 500); // 2 seconds delay
  }

  private getSetting() {
    const subscription = this.settingService.getSetting('orderSetting blog')
      .subscribe({
        next: res => {
          this.isEnableHomeRecentOrder = res.data?.orderSetting?.isEnableHomeRecentOrder;
          this.isEnableBlog = res.data?.blog?.isEnableBlog;
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  /**
   * Popup Logic
   * popupView()
   */

  private popupView() {
    const isClosePopupDialog = this.storageService.getDataFromSessionStorage('POPUP_DIALOG');
    if (!isClosePopupDialog) {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.getPopup();
        }, 2000)
      }
    }
  }


  /**
   * Dialog View
   * openPopupDialog()
   */
  openPopupDialog() {
    const dialogRef = this.dialog.open(PopupDialogComponent, {
      data: this.popup,
      maxWidth: '600px',
      width: '100%',
      maxHeight: "600px",
      panelClass: ['dialog', 'offer-dialog']
    });
    const subscription = dialogRef.afterClosed().subscribe(() => {
      this.storageService.storeDataToSessionStorage('POPUP_DIALOG', true)
    });
    this.subscriptions?.push(subscription);
  }


  /**
   * HTTP Req Handle
   * getAllTags()
   * getPopup()
   */
  getAllTags() {
    const subscription = this.tagService.getAllTags()
      .subscribe({
        next: res => {
          this.tags = res.data;
        },
        error: (err) => {
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }

  private getPopup() {
    const subscription = this.popupService.getPopup().subscribe({
      next: (res) => {
        if (res.success) {
          this.popup = res.data;
          if (this.popup) {
            this.openPopupDialog();
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions?.push(subscription);
  }

  private getAllSeoPage() {
    const subscription = this.seoPageService.getAllSeoPageByUi({status: 'publish', 'type': 'home-page'}, 1, 1).subscribe({
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
    const seoTitle = this.seoPageData?.seoTitle ? this.seoPageData?.seoTitle : 'Home';
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
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
