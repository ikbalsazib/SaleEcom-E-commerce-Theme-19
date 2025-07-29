import {Component, inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {ImgCtrlPipe} from "../../../../../pipes/img-ctrl.pipe";
import {isPlatformBrowser, NgOptimizedImage} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ShopInformation} from "../../../../../../interfaces/common/shop-information.interface";

@Component({
  selector: 'app-footer-xl-1',
  standalone: true,
    imports: [
        ImgCtrlPipe,
        NgOptimizedImage,
        RouterLink
    ],
  templateUrl: './footer-xl-1.component.html',
  styleUrl: './footer-xl-1.component.scss'
})
export class FooterXl1Component implements OnInit {
// Decorator
  @Input() shopInfo: ShopInformation;
  isHomeRoute: boolean = false;
  domain: string = '';

  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';

  // Inject
  private readonly platformId = inject(PLATFORM_ID)

  constructor(
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.isHomeRoute = this.router.url === '/'; // Check if it's the home route
    });

    if (isPlatformBrowser(this.platformId)) {
      this.domain = window.location.host;
    }
  }

  /**
   * HTTP REQUEST
   * getSocialLink()
   */

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


      default:
        return null;
    }
  }


}
