import {inject, Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {PixelService} from './pixel.service';
import {GtmService} from './gtm.service';
import {ScriptLoaderService} from './script-loader.service';
import {TiktokPixelService} from './tiktok-pixel.service';
import {Meta} from '@angular/platform-browser';


@Injectable({
  providedIn: 'root',
})

export class AppConfigService {

  private config: any;
  private readonly CONFIG_KEY = 'themeConfig'; // LocalStorage key
  private _currency: any;

  private configSubject = new BehaviorSubject<any>(null);
  config$ = this.configSubject.asObservable(); // Expose as Observable
  private readonly meta = inject(Meta);

  constructor(
    private http: HttpClient,
    private pixel: PixelService,
    private gtmService: GtmService,
    private scriptLoaderService: ScriptLoaderService,
    private tiktokPixelService: TiktokPixelService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
  }


  get currency(): any {
    return this._currency;
  }


  set currency(currency: any) {
    this._currency = currency;
  }


  /**
   * loadConfig()
   * checkForUpdates()
   * getSettingData()
   */
  async loadConfig(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) { // ✅ Check if it's running in a browser
      const storedConfig = localStorage.getItem(this.CONFIG_KEY);
      if (storedConfig) {
        this.config = JSON.parse(storedConfig);
        this.configSubject.next(this.config);

        // Initial setup from cached data to prevent race conditions
        this.initAnalytics();
      }
    }

    // নতুন ডাটা চেক করতে API কল করবে
    await this.checkForUpdates();
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const newConfig = await firstValueFrom(this.http.get(`/shop-settings.json?v=${new Date().getTime()}`));

      if (!this.config || JSON.stringify(this.config) !== JSON.stringify(newConfig)) {
        this.config = newConfig;
        this.configSubject.next(newConfig); // 🔥 Emit new config data

        if (isPlatformBrowser(this.platformId)) { // ✅ Only update LocalStorage if in browser
          localStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig));
        }

      } else {
        // ✅ Success Path: Initialize even if data hasn't changed
      }

      // ✅ Success Path: Initialize after fetching fresh data
      this.initAnalytics();

    } catch (error) {
      console.error("⚠️ Error fetching config:", error);
      // ✅ Fallback Path: Ensure analytics are initialized even if network fails
      this.initAnalytics();
    }
  }

  private initAnalytics() {
    if (!this.config) return;

    // Google Search Console (Run on both SSR and Client)
    const gscToken = this.config['googleSearchConsoleToken'];
    if (gscToken) {
      this.addGoogleVerification(gscToken);
    }

    if (isPlatformBrowser(this.platformId)) {
      const analytics = this.getSettingData('analytics');
      const currency = this.getSettingData('currency');

      // 1️⃣ Meta Pixel: Handle ID and Fallback
      if (analytics?.facebookPixelId) {
        this.gtmService.facebookPixelId = analytics.facebookPixelId;
        this.pixel.init(analytics.facebookPixelId);
      } else {
        this.gtmService.facebookPixelId = ''; // Prevent ID leak from previous session
      }

      // 2️⃣ GTM: Centralized Tag Management
      this.gtmService.isManageFbPixelByTagManager = !!analytics?.IsManageFbPixelByTagManager;

      if (analytics?.tagManagerId) {
        this.gtmService.tagManagerId = analytics.tagManagerId;
        this.scriptLoaderService.loadGtmScript(analytics.tagManagerId);
        this.scriptLoaderService.loadGtmNoScript(analytics.tagManagerId);
      } else {
        this.gtmService.tagManagerId = ''; // Prevent ID leak
      }

      // 3️⃣ TikTok Pixel: Multi-Shop Support
      if (analytics?.tiktokPixelId) {
        this.tiktokPixelService.init(analytics.tiktokPixelId, this.getSettingData('shop'));
      }

      // 4️⃣ Global Currency Sync
      if (currency) {
        this.currency = currency;
      }
    }
  }

  private addGoogleVerification(token: string) {
    if (token) {
      this.meta.updateTag({ name: 'google-site-verification', content: token });
    }
  }

  getSettingData(field: string): any {
    return field ? this.config?.[field] : this.config;
  }

}
