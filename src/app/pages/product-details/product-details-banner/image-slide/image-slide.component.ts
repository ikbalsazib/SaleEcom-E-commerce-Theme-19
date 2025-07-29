import {Component, HostListener, Input, OnInit} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-image-slide',
  templateUrl: './image-slide.component.html',
  styleUrl: './image-slide.component.scss',
  standalone: true,
  imports: [
    NgClass
  ]
})
export class ImageSlideComponent implements OnInit {
  // Decorator
  @Input() inputImages: string[] = [];
  image: string | null = null;
  hoveredImage: string | null = null;
  transformStyle: string = 'translateX(0)';
  currentIndex: number = 0;
  visibleImages: number = 5;
  slideWidth: number = 110;

  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '640w, 750w';

  ngOnInit() {
    if (this.inputImages.length > 0) {}
    this.adjustVisibleImages();
  }

  selectImage(image: string) {
    this.hoveredImage = image;
    this.image = image;
  }

  hoverImage(image: string) {
    this.hoveredImage = image;
    this.image = image;
  }

  // Scroll left (slide to previous image)
  scrollLeft() {
    if (this.inputImages.length === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateTransform();
    }
  }

  // Scroll right (slide to next image)
  scrollRight() {
    if (this.inputImages.length === 0) return; // Prevent sliding if no images
    if (this.currentIndex < this.inputImages.length - this.visibleImages) {
      this.currentIndex++;
      this.updateTransform();
    }
  }

  // Update transform based on the current index
  updateTransform() {
    this.transformStyle = `translateX(-${this.currentIndex * this.slideWidth}px)`;
  }

  // Dynamically adjust the number of visible images
  updateVisibleImages() {
    // Recalculate the transform when visible images are changed
    this.updateTransform();
  }

  // Automatically adjust visible images based on screen size
  adjustVisibleImages() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      this.visibleImages = 2; // Show fewer images on small screens
    } else if (screenWidth < 900) {
      this.visibleImages = 3; // Medium screens
    } else {
      this.visibleImages = 5; // Large screens
    }
    this.updateVisibleImages();
  }

  // Listen for window resize events and adjust visible images
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.adjustVisibleImages();
  }
}
