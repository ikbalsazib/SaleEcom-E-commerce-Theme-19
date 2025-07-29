import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {ReloadService} from "../../../services/core/reload.service";
import {isPlatformBrowser, NgForOf, NgStyle, ViewportScroller} from "@angular/common";
import {Router} from "@angular/router";
import {
  GalleryImageViewerComponent
} from "../../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-our-product',
  templateUrl: './our-product.component.html',
  styleUrl: './our-product.component.scss',
  imports: [
    NgForOf,
    GalleryImageViewerComponent,
    ImageGalleryComponent,
    NgStyle,
    TranslatePipe
  ],
  standalone: true
})
export class OurProductComponent {
  @Input() singleLandingPage: any;
  isMobile: number = window.innerWidth;
  selectedMenu = 0;
  showModal = false;
  imageVisible = false;
  textVisible = false;

  // Gallery
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  @Input() cartSaleSubTotal: any;

  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly platformId = inject(PLATFORM_ID);
  /**
   * SCROLL WITH NAVIGATE
   * onScrollWithNavigate()
   */

  public onScrollWithNavigate(type: string) {
    switch (true) {
      case type === "payment":
        this.selectedMenu = 1;
        this.reloadService.needRefreshSticky$(true);
        break;
      default:
        this.selectedMenu = 0;
    }
  }

  /***
   * HOSTLISTENER FUNCTIONALITY
   */

  @HostListener('window:resize')
  onGetInnerWidth() {
    this.isMobile = window.innerWidth;
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
    // this.router.navigate([], {queryParams: {'gallery-image-view': true}, queryParamsHandling: 'merge'}).then();
  }

  openGalleryMobile(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.showModal = true;
    // this.router.navigate([], {queryParams: {'gallery-image-view': true}, queryParamsHandling: 'merge'}).then();
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    // this.router.navigate([], {queryParams: {'gallery-image-view': null}, queryParamsHandling: 'merge'}).then();
  }

  closeModal1() {
    this.showModal = false;
  }

  @HostListener('window:scroll')
  scrollBody() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the footer's Y offset position
      const [_, footerTop] = this.viewportScroller.getScrollPosition();
      const windowHeight = window.innerHeight;
      const footerOffsetTop = document.getElementById('benefit')?.offsetTop || 0;

      if (window.scrollY + windowHeight >= footerOffsetTop) {
        this.imageVisible = true;
        this.textVisible = true;
      } else {
        this.imageVisible = false;
        this.textVisible = false;
      }
    }
  }
}
