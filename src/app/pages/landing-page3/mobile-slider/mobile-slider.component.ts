import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-mobile-slider',
  templateUrl: './mobile-slider.component.html',
  styleUrl: './mobile-slider.component.scss'
})
export class MobileSliderComponent {
  @Input() product:any;

  currentSlide = 0;
  translateX = 0; // Current position of the slider
  isDragging = false;
  startX: number = 0;
  currentTranslateX: number = 0;
  velocity = 0; // For momentum
  animationDuration = '0.25s'; // Shorter duration for faster snap animations
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  get maxTranslateX(): number {
    return -(this.product.images.length - 1) * 100; // Maximum scrollable distance
  }

  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '640w, 750w';

  startDragging(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.animationDuration = '0s'; // Disable snapping animation during drag
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
    this.animationDuration = '0.25s'; // Fast snap animation

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



  showModal = false;

  openModal(event:any, images:any,index: number) {
    event.stopPropagation();
    if (index) {

      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.showModal = true;
  }

  closeModal1() {
    this.showModal = false;
  }
}
