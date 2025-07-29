import {Component, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterLink} from "@angular/router";
import {Banner} from "../../../../interfaces/common/banner.interface";
import {BannerService} from "../../../../services/common/banner.service";
import {Subscription} from "rxjs";
import {FilterData} from "../../../../interfaces/core/filter-data";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";
import {BannerLoaderOneComponent} from "../../../../shared/loader/banner-loader-one/banner-loader-one.component";

@Component({
  selector: 'app-banner-1',
  standalone: true,
  imports: [
    RouterLink,
    BannerLoaderOneComponent
  ],
  templateUrl: './banner-1.component.html',
  styleUrl: './banner-1.component.scss'
})
export class Banner1Component implements OnInit, OnDestroy {

  // Store Data
  banners: Banner[] = [];
  isLoading: boolean = true;
  isMobile: number;
  isBrowser: boolean;
  isServer: boolean;

  // Inject
  private readonly bannerService = inject(BannerService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isServer = isPlatformServer(this.platformId);
    this.isMobile = this.isBrowser ? window.innerWidth : 1920;
  }

  ngOnInit() {
    // Base Data
    this.getAllBanner();
  }


  /**
   * HTTP Request Handle
   * getAllBanner()
   */
  private getAllBanner(): void {
    const filterData: FilterData = {
      filter: {status: 'publish'},
      pagination: null,
      select: {
        name: 1,
        type: 1,
        images: 1,
        showHome: 1,
      },
      sort: {priority: -1}
    };

    const subscription = this.bannerService.getAllBanner(filterData, null).subscribe({
      next: res => {
        this.banners = res.data;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      }
    });
    this.subscriptions?.push(subscription);
  }

  // Window Resize Event Handler
  @HostListener('window:resize')
  onGetInnerWidth(): void {
    this.isMobile = window.innerWidth;
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
