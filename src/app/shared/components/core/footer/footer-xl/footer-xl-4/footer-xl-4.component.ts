import {AfterViewInit, Component, inject, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {ShopInformation} from "../../../../../../interfaces/common/shop-information.interface";
import {Router, RouterLink} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {Subscription} from "rxjs";

declare var FB: any;
@Component({
  selector: 'app-footer-xl-4',
  templateUrl: './footer-xl-4.component.html',
  styleUrl: './footer-xl-4.component.scss',
  standalone: true,
  imports: [
    RouterLink
  ]
})
export class FooterXl4Component implements OnInit, AfterViewInit  {
// Decorator
  @Input() shopInfo: ShopInformation;
  isHomeRoute: boolean = false;
  isBrowser: boolean;
  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';

  domain: string = '';


  // Subscription
  private subscriptions: Subscription[] = [];


  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.isHomeRoute = this.router.url === '/'; // Check if it's the home route
    });
    if (isPlatformBrowser(this.platformId)) {
      this.domain = window.location.host;
    }

  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      // Once the script loads, call FB.XFBML.parse() to render the widget.
      script.onload = () => {
        if (typeof FB !== 'undefined') {
          FB.XFBML.parse();
        }
      };

      document.body.appendChild(script);
    }
  }


  /**
   * HTTP REQUEST
   * getSocialLink()
   */
  getSocialLink2(): any {
    if (this.isBrowser) {
      let url = this.shopInfo?.socialLinks.find(f => f?.type === 0)?.value ?? null;
      return url.replace(/['"]/g, '').trim();
    }
  }


  getSocialLink(type: string): string {
    switch (type) {
      case 'facebook':
        return this.shopInfo?.socialLinks.find(f => f.type === 0)?.value ?? null;

      case 'youtube':
        return this.shopInfo?.socialLinks.find(f => f.type === 1)?.value ?? null;

      case 'twitter':
        return this.shopInfo?.socialLinks.find(f => f.type === 2)?.value ?? null;

      case 'instagram':
        return this.shopInfo?.socialLinks.find(f => f.type === 3)?.value ?? null;

      case 'linkedin':
        return this.shopInfo?.socialLinks.find(f => f.type === 4)?.value ?? null;


      case 'tiktok':
        return this.shopInfo?.socialLinks.find(f => f.type === 5)?.value ?? null;

      case 'telegram':
        return this.shopInfo?.socialLinks.find(f => f.type === 7)?.value ?? null;

      case 'join-group':
        return this.shopInfo?.socialLinks.find(f => f.type === 8)?.value ?? null;
      default:
        return null;
    }
  }


  protected readonly inject = inject;
}
