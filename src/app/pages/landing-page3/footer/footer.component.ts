import {Component, inject, Input, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgOptimizedImage, NgStyle} from "@angular/common";
import {ImgCtrlPipe} from "../../../shared/pipes/img-ctrl.pipe";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone:true,
  imports: [
    ImgCtrlPipe,
    NgOptimizedImage,
    RouterLink,
    NgStyle,
    TranslatePipe
  ]
})
export class FooterComponent {
  @Input() shopInfo: any;
  @Input() singleLandingPage: any;
  @Input() websiteInfo: any;
  domain: string = '';
  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {
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
