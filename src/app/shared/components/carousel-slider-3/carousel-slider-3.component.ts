import {
  AfterContentInit,
  Component,
  ContentChild,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TemplateRef
} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-carousel-slider-3',
  templateUrl: './carousel-slider-3.component.html',
  styleUrls: ['./carousel-slider-3.component.scss'],
  imports: [
    NgStyle,
    NgTemplateOutlet,
    NgIf,
    NgForOf,
  ],
  standalone: true
})
export class CarouselSlider3Component implements OnInit, OnDestroy, AfterContentInit {

  @Input() showIndicators: boolean = true;
  @Input() autoPlay: boolean = true;
  @Input() showControls: boolean = true;
  @Input() pauseOnHoverOrTouch: boolean = true;

  @Input() items: any[] = []; // Accept the items array from the parent component
  @ContentChild('carouselSlide', {static: false}) slideTemplate!: TemplateRef<any>;

  currentSlideIndex = 0;
  autoSlideInterval: any;
  isDragging: boolean = false;
  startX: number = 0;

  private readonly platformId = inject(PLATFORM_ID)

  ngOnInit(): void {
    if (this.autoPlay) {
      this.startAutoSlide();
    }

    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('touchstart', this.onTouchStart.bind(this), {passive: true});
      document.addEventListener('touchmove', this.onTouchMove.bind(this), {passive: true});
      document.addEventListener('touchend', this.onTouchEnd.bind(this), {passive: true});
    }
  }

  ngAfterContentInit(): void {
    // Here, you can handle anything you need after the content (templates) is projected
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('touchstart', this.onTouchStart.bind(this));
      document.removeEventListener('touchmove', this.onTouchMove.bind(this));
      document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }

  startAutoSlide(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pauseSlide();
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, 3000);
    }
  }

  pauseSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resumeSlide(): void {
    if (this.autoPlay) {
      this.startAutoSlide();
    }
  }

  nextSlide(): void {
    this.pauseSlide();
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.items.length;
    this.resumeSlide();
  }

  prevSlide(): void {
    this.pauseSlide();
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.items.length) % this.items.length;
    this.resumeSlide();
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.pauseSlide();
    this.resumeSlide();
  }

  onTouchStart(event: TouchEvent): void {
    if (this.pauseOnHoverOrTouch) {
      this.pauseSlide();
    }
    this.onDragStart(event.touches[0].clientX);
  }

  onTouchMove(event: TouchEvent): void {
    this.onDragMove(event.touches[0].clientX);
  }

  onTouchEnd(event: TouchEvent): void {
    this.onDragEnd(event.changedTouches[0].clientX);
    if (this.pauseOnHoverOrTouch) {
      this.resumeSlide();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.pauseOnHoverOrTouch) {
      this.pauseSlide();
    }
    this.onDragStart(event.clientX);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.onDragMove(event.clientX);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.onDragEnd(event.clientX);
    if (this.pauseOnHoverOrTouch) {
      this.resumeSlide();
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.pauseOnHoverOrTouch) {
      this.pauseSlide();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.pauseOnHoverOrTouch) {
      this.resumeSlide();
    }
  }

  onDragStart(startX: number): void {
    if (this.pauseOnHoverOrTouch) {
      this.pauseSlide();
    }
    this.startX = startX;
    this.isDragging = true;
  }

  onDragMove(currentX: number): void {
    const diffX = currentX - this.startX;

    if (Math.abs(diffX) > 5) {
      event?.preventDefault();
    }
  }

  onDragEnd(endX: number): void {
    this.isDragging = false;
    const diffX = endX - this.startX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    }

    if (this.pauseOnHoverOrTouch) {
      this.resumeSlide();
    }
  }
}
