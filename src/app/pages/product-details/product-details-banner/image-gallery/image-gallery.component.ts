import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {popupAnimations} from "../animations";

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
  standalone: true,
  animations: popupAnimations, // Attach animations
})
export class ImageGalleryComponent {

  // Decorator
  @Input() isVisible = false; // Controls visibility
  @Output() close = new EventEmitter<void>();
  @Input() images:any;
  @Input() selectedIndex : number | undefined;

  // Store Data
  touchStartX = 0;
  touchStartY = 0;
  touchEndX = 0;
  touchEndY = 0;
  isDragging = false;
  slideTransition = 'transform 0.2s ease-in-out';

// Zoom and Pan
  scale = 1; // Default scale
  maxScale = 3; // Maximum zoom
  minScale = 1; // Minimum zoom
  translateX = 0; // Horizontal pan
  translateY = 0; // Vertical pan
  isZooming = false;
  lastTouchEnd = 0;
  initialPinchDistance = 0;

// UI visibility control
  hideUI = false;

  get galleryImages(): string[] {
    return [this.images[this.images.length - 1], ...this.images, this.images[0]];
  }

  getRealIndex(): number {
    if (this.selectedIndex === 0) {
      return this.images.length;
    } else if (this.selectedIndex === this.galleryImages.length - 1) {
      return 1;
    } else {
      return this.selectedIndex;
    }
  }

  nextSlide(): void {
    if (this.scale === 1) {
      this.selectedIndex++;
      this.handleLoop();
    }
  }

  prevSlide(): void {
    if (this.scale === 1) {
      this.selectedIndex--;
      this.handleLoop();
    }
  }

  private handleLoop(): void {
    if (this.selectedIndex === this.galleryImages.length - 1) {
      setTimeout(() => {
        this.slideTransition = 'none';
        this.selectedIndex = 1;
      }, 500);
    } else if (this.selectedIndex === 0) {
      setTimeout(() => {
        this.slideTransition = 'none';
        this.selectedIndex = this.images.length;
      }, 500);
    }

    setTimeout(() => {
      this.slideTransition = 'transform 0.2s ease-in-out';
    });
  }

  selectImage(index: number): void {
    this.isDragging = false;
    this.selectedIndex = index + 1;
  }

  onStart(event: TouchEvent | MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    if (event instanceof TouchEvent && event.touches.length === 2) {
      this.isZooming = true;
      this.initialPinchDistance = this.getPinchDistance(event);
      return;
    }
    this.touchStartX = this.getEventX(event);
    this.touchStartY = this.getEventY(event);
    this.touchEndX = this.touchStartX;
    this.touchEndY = this.touchStartY;
  }

  onMove(event: TouchEvent | MouseEvent): void {
    if (!this.isDragging) return;

    if (this.isZooming && event instanceof TouchEvent && event.touches.length === 2) {
      const pinchDistance = this.getPinchDistance(event);
      const pinchDelta = pinchDistance / this.initialPinchDistance;
      this.scale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * pinchDelta));
      this.initialPinchDistance = pinchDistance;
      this.hideUI = this.scale > 1;
      return;
    }

    const deltaX = this.getEventX(event) - this.touchEndX;
    const deltaY = this.getEventY(event) - this.touchEndY;

    if (this.scale === 1) {
      // Slide if not zoomed
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.touchEndX = this.getEventX(event);
        return;
      }
    } else {
      // Pan if zoomed
      const { maxTranslateX, maxTranslateY } = this.calculateBounds();
      const currentX = this.translateX + deltaX;
      const currentY = this.translateY + deltaY;

      const adjustedX = this.clamp(currentX, -maxTranslateX, maxTranslateX);
      const adjustedY = this.clamp(currentY, -maxTranslateY, maxTranslateY);

      this.translateX = adjustedX;
      this.translateY = adjustedY;
    }

    this.touchEndX = this.getEventX(event);
    this.touchEndY = this.getEventY(event);
  }

  onEnd(event: TouchEvent | MouseEvent): void {
    if (event instanceof TouchEvent && event.touches.length < 2) {
      this.isZooming = false;
    }

    if (!this.isDragging) return;

    const deltaX = this.touchStartX - this.touchEndX;
    if (this.scale === 1) {
      if (deltaX > 50) {
        this.nextSlide();
      } else if (deltaX < -50) {
        this.prevSlide();
      }
    }
    this.isDragging = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  getSlideTransform(): string {
    return `translateX(-${this.selectedIndex * 100}%)`;
  }

  private getEventX(event: TouchEvent | MouseEvent): number {
    if (event instanceof TouchEvent) {
      return event.touches[0].clientX;
    } else {
      return (event as MouseEvent).clientX;
    }
  }

  private getEventY(event: TouchEvent | MouseEvent): number {
    if (event instanceof TouchEvent) {
      return event.touches[0].clientY;
    } else {
      return (event as MouseEvent).clientY;
    }
  }

  private getPinchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  closeGallery(): void {
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private calculateBounds(): { maxTranslateX: number; maxTranslateY: number } {
    const container = document.querySelector('.main-image-container') as HTMLElement;
    const image = container.querySelector('.main-image') as HTMLImageElement;

    if (!container || !image) return { maxTranslateX: 0, maxTranslateY: 0 };

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageWidth = image.naturalWidth * this.scale;
    const imageHeight = image.naturalHeight * this.scale;

    const maxTranslateX = Math.max(0, (imageWidth - containerWidth) / 2);
    const maxTranslateY = Math.max(0, (imageHeight - containerHeight) / 2);

    return {
      maxTranslateX: Math.min(maxTranslateX, (containerWidth / 2)),
      maxTranslateY: Math.min(maxTranslateY, (containerHeight / 2))
    };
  }

  @HostListener('touchend', ['$event'])
  onDoubleTap(event: TouchEvent): void {
    const now = new Date().getTime();
    if (now - this.lastTouchEnd <= 300) {
      if (this.scale === 1) {
        this.scale = 2;
        this.hideUI = true; // Hide UI on zoom
      } else {
        this.resetZoom();
        this.hideUI = false; // Show UI on reset
      }
    }
    this.lastTouchEnd = now;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(
      this.maxScale,
      Math.max(this.minScale, this.scale + delta)
    );

    const { maxTranslateX, maxTranslateY } = this.calculateBounds();
    this.translateX = this.clamp(this.translateX, -maxTranslateX, maxTranslateX);
    this.translateY = this.clamp(this.translateY, -maxTranslateY, maxTranslateY);

    this.scale = newScale;

    // Hide UI if zooming in
    this.hideUI = this.scale > 1;
  }

  private resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.hideUI = false; // Show UI when zoom is reset
  }

}
