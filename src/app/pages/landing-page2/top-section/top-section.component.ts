import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf, NgOptimizedImage, NgStyle} from "@angular/common";
import {ReloadService} from "../../../services/core/reload.service";
import {
  GalleryImageViewerComponent
} from "../../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {ImgCtrlPipe} from "../../../shared/pipes/img-ctrl.pipe";
import {RouterLink} from "@angular/router";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-top-section',
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.scss',
  imports: [
    NgIf,
    NgForOf,
    GalleryImageViewerComponent,
    ImgCtrlPipe,
    NgOptimizedImage,
    RouterLink,
    ImageGalleryComponent,
    NgStyle,
    TranslatePipe
  ],
  standalone: true
})
export class TopSectionComponent {
  @Input() singleLandingPage: any;
  @Input() shopInfo: any;
  selectedMenu = 0;
  showModal = false;
  isMobile: number;

  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';

  // Gallery
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  @Input() cartSaleSubTotal: any;

  private readonly reloadService = inject(ReloadService);
  private readonly platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        this.isMobile = window.innerWidth;
      }
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
  }

  openGalleryMobile(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.showModal = true;
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
  }

  closeModal1() {
    this.showModal = false;
  }


  /***
   * HOSTLISTENER FUNCTIONALITY
   */

  @HostListener('window:resize')
  onGetInnerWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth;
    }
  }

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
}
