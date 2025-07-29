import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UtilsService} from './services/core/utils.service';
import {AppConfigService} from './services/core/app-config.service';
import {UserService} from './services/common/user.service';
import {Setting, ThemeViewSetting} from './interfaces/common/setting.interface';
import {SettingService} from './services/common/setting.service';
import {ScriptLoaderService} from './services/core/script-loader.service';
import {isPlatformBrowser} from "@angular/common";
import {Meta, Title} from "@angular/platform-browser";
import {GtmPageView} from "./interfaces/core/gtm.interface";
import {GtmService} from "./services/core/gtm.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  // Theme Settings
  headerViews: string;
  private eventId: string;

  // Store Data
  private setting: Setting;
  currentUrl: string = '/';

  productSetting: any;
  showFooter: boolean = true;

  // Inject
  private readonly appConfigService = inject(AppConfigService);
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly userService = inject(UserService);
  private readonly settingService = inject(SettingService);
  private readonly scriptLoaderService = inject(ScriptLoaderService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly titleService = inject(Title);
  private readonly gtmService = inject(GtmService);
  private readonly meta = inject(Meta);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {

    // Base
    this.getSettingData();
    this.userService.autoUserLoggedIn();
    this.userService.getUserDataFromLocal();

    // Api Data
    if (isPlatformBrowser(this.platformId)) {
      this.setColorVariable();
      this.getSetting();
    }

    // On change route
    this.onChangeRouterEvent();

    // Check Query Param for Affiliate
    this.checkActivateQueryParam()
  }

  private onChangeRouterEvent() {
    const subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.utilsService.removeUrlQuery(event.urlAfterRedirects);

        // Update Title
        this.setSeoTitle()

        // Bottom Nav Hide and view
        this.bottomNavView();
      }
    });
    this.subscriptions.push(subscription);
  }


  /**
   * Set up page view tracking for route changes
   */
  private setupRouteChangeTracking(): void {
    const subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.trackPageViewEvent();
      }
    });
    this.subscriptions.push(subscription);
  }

  /**
   * Track page view event for route changes
   */
  private trackPageViewEvent(): void {
    // 1️⃣ Generate unique event ID
    this.generateEventId();
    // 2️⃣ Get hashed user data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      lastName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare custom_data
    const page_url = location.href;
    const page_title = document.title;
    const referrer = document.referrer || 'N/A';

    const custom_data = {
      page_url,
      page_title,
      referrer,
    };

    // 4️⃣ Server-side data for Conversions API
    const pageViewData: any = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: page_url,
      custom_data,
      ...(Object.keys(user_data).length > 0 && {user_data}),
    };

    // 5️⃣ Browser: Facebook Pixel call (manual)
    if (this.setting.analytics?.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('PageView', custom_data, this.eventId);
      // 7️⃣ Server: Send via Conversions API
      this.trackPageView(pageViewData);
    }

    // 6️⃣ Browser: Push to GTM Data Layer (for GTM-managed Pixel or GA4)
    if (this.setting.analytics?.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        event: 'page_view',
        event_id: this.eventId,
        action_source: 'website',
        event_source_url: page_url,
        page_data: {
          url: page_url,
          title: page_title,
          referrer: referrer,
          custom_data,
          ...(Object.keys(user_data).length > 0 && {user_data}),
        },
      });
    }
  }

  private trackPageView(data: GtmPageView) {
    const subscription = this.gtmService.trackPageView(data)
      .subscribe({
        next: () => {
          // Optional: Handle successful response if needed
        },
        error: (err: any) => {
          console.error('Error tracking page view:', err);
        }
      });
    this.subscriptions.push(subscription);
  }

  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  /**
   * Initial Landing Page Setting
   * getSettingData()
   */

  private getSettingData() {
    const themeViewSettings: ThemeViewSetting[] = this.appConfigService.getSettingData('themeViewSettings');
    this.headerViews = themeViewSettings.find(f => f.type == 'headerViews').value.join();
  }

  private setColorVariable() {
    const themeColors = this.appConfigService.getSettingData('themeColors');
    if (themeColors && themeColors) {
      document.documentElement.style.setProperty('--shop-color-primary', themeColors.primary);
      document.documentElement.style.setProperty('--shop-color-secondary', themeColors.secondary);
      document.documentElement.style.setProperty('--shop-color-tertiary', themeColors.tertiary);
    }
  }


  /**
   * HTTP Req Handle
   * getSetting()
   */


  private getSetting() {
    const subscription = this.settingService.getSetting('analytics googleSearchConsoleToken currency -_id', 'productSetting')
      .subscribe({
        next: (res) => {
          this.setting = res.data;

          if (res.data && res.data.productSetting) { //added later for url setting of product details
            this.productSetting = res.data.productSetting;
            // this.setFormData();
          }
          if (this.setting.analytics?.facebookPixelId) {
            this.gtmService.facebookPixelId = this.setting.analytics?.facebookPixelId;
            this.scriptLoaderService.loadPixelScript(this.setting.analytics?.facebookPixelId);
            this.scriptLoaderService.loadFacebookPixelNoScript(this.setting.analytics?.facebookPixelId);
          }

          if (this.setting.analytics?.tagManagerId) {
            this.gtmService.tagManagerId = this.setting.analytics?.tagManagerId;
            this.scriptLoaderService.loadGtmScript(this.setting.analytics?.tagManagerId);
            this.scriptLoaderService.loadGtmNoScript(this.setting.analytics?.tagManagerId);
          }

          if (this.setting.analytics?.tagManagerId && this.setting.analytics?.IsManageFbPixelByTagManager) {
            this.gtmService.isManageFbPixelByTagManager = this.setting.analytics?.IsManageFbPixelByTagManager
          }

          // Initialize analytics tracking after configuration is loaded
          const shouldTrackAnalytics = this.setting.analytics?.facebookPixelId || this.setting.analytics?.tagManagerId || this.setting.analytics?.IsManageFbPixelByTagManager === true;

          if (shouldTrackAnalytics) {
            // Track initial page view
            // this.trackInitialPageView();

            // Set up tracking for future route changes
            this.setupRouteChangeTracking();
          } else {
            console.log('🔍 Analytics tracking not initialized - missing configuration');
          }

          if (this.setting.currency) {
            this.appConfigService.currency = this.setting.currency;
          }

          if (this.setting?.googleSearchConsoleToken) {
            this.addGoogleVerification(this.setting?.googleSearchConsoleToken);
          }
        },
        error: () => {
        },
      });
    this.subscriptions?.push(subscription);
  }

  addGoogleVerification(data: string) {
    this.meta.addTag({
      name: 'google-site-verification',
      content: data
    });
  }


  private setSeoTitle() {
    const routePath = this.router.url.split('?')[0]; // Remove query parameters
    let title = 'Saleecom';

    switch (routePath) {
      case '/':
        title = 'Home';
        break;
      case '/my-account':
        title = 'My Account';
        break;
      case '/my-order-list':
        title = 'My Order List';
        break;
      case '/my-wishlist':
        title = 'My Wishlist';
        break;
      case '/my-address':
        title = 'My Address';
        break;
      case '/my-review':
        title = 'My Review';
        break;
      case '/setting':
        title = 'My Setting';
        break;
      case '/cart':
        title = 'Cart';
        break;
      case '/checkout':
        title = 'Checkout';
        break;
      case '/order-tracking':
        title = 'Order Tracking';
        break;
      default:
        // Handle dynamic routes
        if (routePath.startsWith('/product-details/')) {
          const productSlug = routePath.split('/product-details/')[1]; // Extract slug
          title = `Product Detail - ${this.formatTitle(productSlug)}`;
        } else if (routePath.startsWith('/order-details/')) {
          title = 'Order Details';
        }
        break;
    }

    this.titleService.setTitle(title);
  }

  /**
   * Function to format slug into a readable title
   */
  private formatTitle(slug: string): string {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private bottomNavView() {
    // Hide footer for product-details, products, and single-segment product details routes
    this.showFooter = !(this.currentUrl.startsWith('/product-details/') ||
      this.currentUrl.startsWith('/products/') ||
      (/^\/[a-zA-Z0-9_-]+$/.test(this.currentUrl) && ![
        '/',
        '/my-account',
        '/my-order-list',
        '/my-wishlist',
        '/my-address',
        '/my-review',
        '/setting',
        '/cart',
        '/checkout',
        '/order-tracking',
        '/blogs',
        '/product-categories',
        '/search',
        '/success-order',
        '/failed-order',
        '/add-review',
        '/pending-review',
        '/settings-security',
        '/edit-profile',
        '/invoice',
        '/order-details',
        '/blog-details',
        '/pages',
        '/forget-password',
        '/products',
        '/test'
      ].includes(this.currentUrl)));
  }

  private checkActivateQueryParam() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.queryParamMap.subscribe(qParam => {
        const affiliateId = qParam.get("affiliateId");
        const affiliateProductId = qParam.get("productId");

        const existingData = sessionStorage.getItem('affiliateSessionData');

        // Parse old data if exists
        const parsed = existingData ? JSON.parse(existingData) : null;

        // যদি পুরাতন ডেটা না থাকে বা নতুন ID ভিন্ন হয়
        const isNewOrChanged =
          !parsed ||
          parsed.affiliateId !== affiliateId ||
          parsed.affiliateProductId !== affiliateProductId;

        if (affiliateId && affiliateProductId && isNewOrChanged) {
          const affiliateSessionData = {
            affiliateId,
            affiliateProductId,
          };

          sessionStorage.setItem(
            'affiliateSessionData',
            JSON.stringify(affiliateSessionData),
          );

        } else {
          console.log('ℹ️ Existing affiliate data reused');
        }
      });
    }
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
