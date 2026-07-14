import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgIf, NgOptimizedImage} from "@angular/common";
import {ReloadService} from "../../../services/core/reload.service";
import {
  GalleryImageViewerComponent
} from "../../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {ImgCtrlPipe} from "../../../shared/pipes/img-ctrl.pipe";
import {RouterLink} from "@angular/router";
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";

@Component({
  selector: 'app-top-section',
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.scss',
  imports: [
    NgIf,
    GalleryImageViewerComponent,
    ImgCtrlPipe,
    NgOptimizedImage,
    RouterLink,
    ImageGalleryComponent
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
  days: any;
  hours: any;
  min: any;
  sec: any;
  result: any;

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
          setInterval(() => {
            this.setTimer();
          }, 1000)
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





setTimer() {
  var dest = new Date(this.singleLandingPage?.endDate).getTime();
  var now = new Date().getTime();
  var diff = dest - now;
  this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
  this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  this.min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  this.sec = Math.floor((diff % (1000 * 60)) / 1000);

  if (this.days < 10) {
    this.days = '0' + this.days;
  }
  if (this.hours < 10) {
    this.hours = '0' + this.hours;
  }
  if (this.min < 10) {
    this.min = '0' + this.min;
  }
  if (this.sec < 10) {
    this.sec = "0" + this.sec;
  }

  this.result = `${this.days} : ${this.hours} : ${this.min} : ${this.sec}`;
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
