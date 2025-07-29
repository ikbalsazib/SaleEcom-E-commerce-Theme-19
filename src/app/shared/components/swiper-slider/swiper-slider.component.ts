import {AfterViewInit, Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-swiper-slider',
  templateUrl: './swiper-slider.component.html',
  styleUrl: './swiper-slider.component.scss',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ]
})
export class SwiperSliderComponent implements AfterViewInit, OnChanges {
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = true;
  @Input() slidePreview: number = 1;
  @Input() breakPoint: object = {};
  @Input() autoplayDelay: number = 3000;
  @Input() showNavigation: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() spaceBetween: number = 10;
  @Input() slidesPerGroup: number = 1;
  @Input() items: string[] = [];

  private container: HTMLElement;
  private track: HTMLElement;
  private slides: HTMLElement[];
  private prevBtn: HTMLElement;
  private nextBtn: HTMLElement;
  private currentIndex: number = 0;
  private slideCount: number;
  private isAnimating: boolean = false;
  private autoplayIntervalId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    // Check if we're in the browser before accessing `window` and `document`
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Now we are sure we're running in the browser
      this.container = document.querySelector('#my-slider') as HTMLElement;
      this.track = this.container.querySelector('.slider-track') as HTMLElement;
      this.slides = Array.from(this.container.querySelectorAll('.slide')) as HTMLElement[];
      this.prevBtn = this.container.querySelector('.prev') as HTMLElement;
      this.nextBtn = this.container.querySelector('.next') as HTMLElement;
      this.slideCount = this.slides.length;

      this.slides.forEach(slide => {
        slide.style.marginRight = `${this.spaceBetween}px`; // Apply space between slides
      });

      if (this.loop) {
        const firstClone = this.slides[0].cloneNode(true) as HTMLElement;
        const lastClone = this.slides[this.slides.length - 1].cloneNode(true) as HTMLElement;
        this.track.appendChild(firstClone);
        this.track.insertBefore(lastClone, this.slides[0]);
        this.slides = Array.from(this.container.querySelectorAll('.slide')) as HTMLElement[];
        this.currentIndex = 1;
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
      }

      this.prevBtn.addEventListener('click', () => this.prevSlide());
      this.nextBtn.addEventListener('click', () => this.nextSlide());
      this.track.addEventListener('transitionend', () => this.transitionEnd());
      this.initDragEvents();

      if (this.autoplay) {
        this.startAutoplay();
        this.container.addEventListener('pointerdown', () => this.stopAutoplay());
        this.container.addEventListener('pointerup', () => this.startAutoplay());
        this.container.addEventListener('pointerleave', () => this.startAutoplay());
      }

      if (!this.showNavigation) {
        this.prevBtn.style.display = 'none';
        this.nextBtn.style.display = 'none';
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['autoplay']) {
      this.autoplay ? this.startAutoplay() : this.stopAutoplay();
    }
  }

  nextSlide(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex += this.slidesPerGroup;
    this.track.style.transition = 'transform 0.5s ease';
    this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
  }

  prevSlide(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex -= this.slidesPerGroup;
    this.track.style.transition = 'transform 0.5s ease';
    this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
  }

  private startAutoplay(): void {
    if (this.autoplayIntervalId !== null) return;
    this.autoplayIntervalId = window.setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  private stopAutoplay(): void {
    if (this.autoplayIntervalId !== null) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = null;
    }
  }

  private transitionEnd(): void {
    if (this.currentIndex === 0) {
      this.track.style.transition = 'none';
      this.currentIndex = this.slideCount;
      this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
      this.track.getBoundingClientRect();
      this.track.style.transition = 'transform 0.5s ease';
    }
    if (this.currentIndex === this.slides.length - 1) {
      this.track.style.transition = 'none';
      this.currentIndex = 1;
      this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
      this.track.getBoundingClientRect();
      this.track.style.transition = 'transform 0.5s ease';
    }
    this.isAnimating = false;
  }

  private initDragEvents(): void {
    let startX: number = 0;
    let currentX: number = 0;
    let dragging: boolean = false;

    this.track.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      currentX = startX;
      dragging = true;
      this.track.style.transition = 'none';
      (e.target as Element).setPointerCapture(e.pointerId);
    });

    this.track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      currentX = e.clientX;
      const dx = currentX - startX;
      const translatePercent = -(this.currentIndex * (100 + this.spaceBetween)) + (dx / this.container.clientWidth) * (100 + this.spaceBetween);
      this.track.style.transform = `translateX(${translatePercent}%)`;
    });

    this.track.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = currentX - startX;
      const threshold = this.container.clientWidth * 0.2;
      this.track.style.transition = 'transform 0.5s ease';
      if (dx < -threshold) {
        this.nextSlide();
      } else if (dx > threshold) {
        this.prevSlide();
      } else {
        this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
      }
    });

    this.track.addEventListener('pointercancel', () => {
      if (dragging) {
        dragging = false;
        this.track.style.transition = 'transform 0.5s ease';
        this.track.style.transform = `translateX(-${this.currentIndex * (100 + this.spaceBetween)}%)`;
      }
    });
  }
}
