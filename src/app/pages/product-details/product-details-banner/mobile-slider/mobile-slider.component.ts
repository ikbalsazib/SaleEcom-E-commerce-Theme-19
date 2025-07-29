import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {ImageLoadErrorDirective} from "../../../../shared/directives/image-load-error.directive";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-mobile-slider',
  templateUrl: './mobile-slider.component.html',
  styleUrl: './mobile-slider.component.scss',
  standalone: true,
  imports: [
    ImageGalleryComponent,
    ImageLoadErrorDirective,
    NgClass
  ]
})
export class MobileSliderComponent implements OnChanges{
  // Decorator
  @Input() product:any;
  @Input() isAllowedShop:any;
  @Input() newSelectedimage: string | null = null;

  // Store Data
  showModal = false;
  currentSlide = 0;
  translateX = 0;
  isDragging = false;
  startX: number = 0;
  currentTranslateX: number = 0;
  velocity = 0;
  animationDuration = '0.10s';
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newSelectedimage'] && this.newSelectedimage) {
      const img = this.newSelectedimage;

      const existingIndex = this.product?.images?.indexOf(img);

      if (existingIndex !== -1) {
        // Image already exists, show that one
        this.currentSlide = existingIndex;
      } else {
        // Push the image if it doesn't exist
        this.product?.images?.push(img);
        this.currentSlide = this.product.images.length - 1;
      }

      // Snap to that image
      this.translateX = -this.currentSlide * 100;
    }
  }
  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '640w, 750w';

  /**
   * startDragging
   * onDrag
   * stopDragging
   * openModal
   */
  startDragging(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.animationDuration = '0s';
    const touchEvent = event as TouchEvent;
    this.startX = touchEvent.touches
      ? touchEvent.touches[0].clientX
      : (event as MouseEvent).clientX;
    this.currentTranslateX = this.translateX;
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const touchEvent = event as TouchEvent;
    const currentX = touchEvent.touches
      ? touchEvent.touches[0].clientX
      : (event as MouseEvent).clientX;

    const deltaX = currentX - this.startX;

    // Update the translation dynamically for drag
    this.translateX = this.currentTranslateX + (deltaX / window.innerWidth) * 120; // Higher sensitivity
  }

  stopDragging(event?: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.animationDuration = '0.10s'; // Fast snap animation

    // Calculate swipe velocity
    const touchEvent = event as TouchEvent;
    const endX = touchEvent?.touches
      ? touchEvent.changedTouches[0].clientX
      : (event as MouseEvent)?.clientX || 0;
    this.velocity = (endX - this.startX) / window.innerWidth;

    // Snap based on velocity and closest slide
    const snapIndex =
      this.velocity > 0.2
        ? Math.max(0, this.currentSlide - 1) // Swipe to previous
        : this.velocity < -0.2
          ? Math.min(this.product.images.length - 1, this.currentSlide + 1) // Swipe to next
          : Math.round(Math.abs(this.translateX) / 100); // Snap to nearest

    this.currentSlide = snapIndex;
    this.translateX = -this.currentSlide * 100; // Snap to slide
  }

  openModal(event:any, images:any,index: number) {
    event.stopPropagation();
    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.showModal = true;
  }

  // closeModal1
  closeModal1() {
    this.showModal = false;
  }

}
