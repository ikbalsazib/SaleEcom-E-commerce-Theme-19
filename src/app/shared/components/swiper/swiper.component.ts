import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef, HostListener, Inject, Input,
  OnDestroy,
  OnInit, PLATFORM_ID,
  QueryList, Renderer2,
  ViewChild
} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-swiper',
  templateUrl: './swiper.component.html',
  styleUrl: './swiper.component.scss',
  imports: [
    NgForOf,
    NgIf
  ],
  standalone: true
})

export class SwiperComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('sliderTrack') sliderTrack!: ElementRef;

  @ContentChildren('sliderItem', {read: ElementRef}) items!: QueryList<ElementRef>;


  @Input() visibleSlides: number = 4;

  @Input() gap: number = 20;

  @Input() autoplay: boolean = false;

  @Input() autoplayInterval: number = 3000;

  @Input() pagination: boolean = true;

  @Input() loop: boolean = false;

  @Input() breakpoints: any = {};
  @Input() navigation: boolean = true;

  private initialized: boolean = false;

  private resizeObserver: ResizeObserver | null = null;

  private currentBreakpoint: string = '';

  private resizeTimeout: any;


  currentIndex: number = 0;

  isDragging: boolean = false;

  startX: number = 0;

  currentX: number = 0;

  walkDistance: number = 0;

  currentTranslate: number = 0;

  prevTranslate: number = 0;

  animationID: number = 0;

  dragThreshold: number = 20;

  autoplayTimer: any;

  itemWidth: number = 0;

  lastTime: number = 0;

  velocity: number = 0;

  originalItems: ElementRef[] = [];

  totalSlides: number = 0;

  isTransitioning: boolean = false;


  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.handleResize = this.handleResize.bind(this);
  }

  get maxIndex(): number {
    return this.loop
      ? this.totalSlides - 1
      : Math.max(0, this.totalSlides - this.visibleSlides);
  }


  get currentPage(): number {

    let adjustedIndex = this.currentIndex;

    if (this.loop) {

      adjustedIndex = (this.currentIndex - this.visibleSlides + this.totalSlides) % this.totalSlides;

    }

    return Math.floor(adjustedIndex / this.visibleSlides);

  }


  get totalPages(): number {

    return Math.ceil(this.totalSlides / this.visibleSlides);

  }


  private initializeSlider(): void {

    if (!this.sliderTrack || !this.items?.length) return;


    const track = this.sliderTrack.nativeElement;

    const container = track.parentElement;


    // Store original items

    this.originalItems = this.items.toArray();

    this.totalSlides = this.originalItems.length;


    // Clear existing clones

    track.querySelectorAll('.clone').forEach((clone: Element) => clone.remove());


    // Calculate dimensions

    const containerWidth = container.offsetWidth;

    const currentGap = this.gap;

    const totalGaps = Math.ceil(this.visibleSlides) - 1;

    const availableWidth = containerWidth - (currentGap * totalGaps);

    const slideWidth = availableWidth / this.visibleSlides;


    // Update track styles

    this.renderer.setStyle(track, '--slide-gap', `${currentGap}px`);

    this.renderer.setStyle(track, '--slide-width', `${slideWidth}px`);


// Apply styles to items
    this.items.forEach((item, index) => {
      const element = item.nativeElement;
      this.renderer.setStyle(element, 'width', `${slideWidth}px`);
      this.renderer.setStyle(element, 'flex', `0 0 ${slideWidth}px`);

      if (index < this.items.length - 1 || this.loop) {
        this.renderer.setStyle(element, 'margin-right', `${currentGap}px`);
      } else {
        this.renderer.setStyle(element, 'margin-right', '0');
      }
    });

    this.itemWidth = slideWidth;


    if (this.loop) {

      this.setupLoop(track);

      this.currentIndex = this.visibleSlides;

    } else {

      this.currentIndex = 0;

    }


    this.updateSliderPosition(false);

    this.initialized = true;

  }


  private setupLoop(track: HTMLElement): void {
    const slidesToClone = Math.ceil(this.visibleSlides);

    // Clone items for both ends
    const beforeClones = this.originalItems.slice(-slidesToClone).map(item => {
      const clone = item.nativeElement.cloneNode(true);
      this.renderer.addClass(clone, 'clone');
      this.renderer.setStyle(clone, 'width', `${this.itemWidth}px`);
      this.renderer.setStyle(clone, 'flex', `0 0 ${this.itemWidth}px`);
      // Always add the gap for clones initially
      this.renderer.setStyle(clone, 'margin-right', `${this.gap}px`);
      return clone;
    });

    const afterClones = this.originalItems.slice(0, slidesToClone).map(item => {
      const clone = item.nativeElement.cloneNode(true);
      this.renderer.addClass(clone, 'clone');
      this.renderer.setStyle(clone, 'width', `${this.itemWidth}px`);
      this.renderer.setStyle(clone, 'flex', `0 0 ${this.itemWidth}px`);
      this.renderer.setStyle(clone, 'margin-right', `${this.gap}px`);
      return clone;
    });

    beforeClones.forEach(clone => {
      this.renderer.insertBefore(track, clone, track.firstChild);
    });

    afterClones.forEach(clone => {
      this.renderer.appendChild(track, clone);
    });

    // Remove the gap on the very last element in the track
    const lastChild = track.lastElementChild;
    if (lastChild) {
      this.renderer.setStyle(lastChild, 'margin-right', '0');
    }
  }


  private handleLoop(): void {

    if (!this.loop || this.isTransitioning) return;


    const track = this.sliderTrack.nativeElement;


    if (this.currentIndex >= this.totalSlides + this.visibleSlides) {

      this.isTransitioning = true;

      this.currentIndex = this.visibleSlides;

      this.renderer.setStyle(track, 'transition', 'none');

      this.updateSliderPosition(false);

      requestAnimationFrame(() => {

        this.renderer.setStyle(track, 'transition', 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)');

        this.isTransitioning = false;

      });

    } else if (this.currentIndex < this.visibleSlides) {

      this.isTransitioning = true;

      this.currentIndex = this.totalSlides + this.visibleSlides - 1;

      this.renderer.setStyle(track, 'transition', 'none');

      this.updateSliderPosition(false);

      requestAnimationFrame(() => {

        this.renderer.setStyle(track, 'transition', 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)');

        this.isTransitioning = false;

      });

    }

  }


  @HostListener('document:mouseup')

  @HostListener('document:touchend')

  stopDragging(): void {

    if (!this.isDragging) return;

    this.isDragging = false;

    cancelAnimationFrame(this.animationID);

    const track = this.sliderTrack.nativeElement;

    this.renderer.setStyle(track, 'cursor', 'grab');

    const momentumDistance = this.velocity * 150;

    const totalMovement = this.walkDistance + momentumDistance;

    const slideWidth = this.itemWidth + this.gap;

    let slidesToMove = Math.round(totalMovement / slideWidth);


    if (this.loop) {

      this.currentIndex -= slidesToMove;

      // this.handleLoop();

    } else {

      this.currentIndex = Math.max(0, Math.min(this.maxIndex, this.currentIndex - slidesToMove));

    }

    this.updateSliderPosition(true);

    this.walkDistance = 0;

    this.velocity = 0;

  }


  private updateSliderPosition(animate: boolean = true): void {

    const track = this.sliderTrack.nativeElement;

    if (animate) {

      this.renderer.setStyle(track, 'transition', 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)');

    } else {

      this.renderer.setStyle(track, 'transition', 'none');

    }


    const position = -(this.currentIndex * (this.itemWidth + this.gap));

    this.renderer.setStyle(track, 'transform', `translateX(${position}px)`);

    this.currentTranslate = position;

    this.prevTranslate = position;


    if (animate && this.loop) {

      setTimeout(() => this.handleLoop(), 500);

    }

  }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize ResizeObserver only in browser
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          this.handleResize();
        }, 100);
      });

      if (this.autoplay) {
        this.startAutoplay();
      }
      window.addEventListener('resize', this.handleResize);
      this.updateBreakpoint();
    }
  }


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
        if (this.sliderTrack && this.resizeObserver) {
          this.resizeObserver.observe(this.sliderTrack.nativeElement);
        }
      });
    }
  }


  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.handleResize);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    }
    this.stopAutoplay();
  }


  private handleResize(): void {

    this.updateBreakpoint();

    this.initializeSlider();

  }


  private updateBreakpoint(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const windowWidth = window.innerWidth;

    const breakpointWidths = Object.keys(this.breakpoints)

      .map(Number)

      .sort((a, b) => b - a);


    let newBreakpoint = '';

    for (const width of breakpointWidths) {

      if (windowWidth >= width) {

        newBreakpoint = width.toString();

        break;

      }

    }


    if (this.currentBreakpoint !== newBreakpoint) {

      this.currentBreakpoint = newBreakpoint;

      const config = this.breakpoints[newBreakpoint];

      if (config) {

        this.visibleSlides = config.slidesPerView;

        this.gap = config.spaceBetween ?? this.gap;

      }

    }

  }


  startDragging(event: MouseEvent | TouchEvent): void {

    if (event.type === 'mousedown') {

      event.preventDefault();

    }


    this.isDragging = true;

    this.startX = this.getPositionX(event);

    this.currentX = this.startX;

    this.lastTime = Date.now();

    this.velocity = 0;


    const track = this.sliderTrack.nativeElement;

    this.renderer.setStyle(track, 'transition', 'none');

    this.renderer.setStyle(track, 'cursor', 'grabbing');


    const style = window.getComputedStyle(track);

    const matrix = new WebKitCSSMatrix(style.transform);

    this.currentTranslate = matrix.m41;

    this.prevTranslate = this.currentTranslate;


    cancelAnimationFrame(this.animationID);

    this.animate();

  }


  @HostListener('document:mousemove', ['$event'])

  @HostListener('document:touchmove', ['$event'])

  drag(event: MouseEvent | TouchEvent): void {

    if (!this.isDragging) return;


    if (event.type === 'mousemove') {

      event.preventDefault();

    }


    const currentTime = Date.now();

    const deltaTime = currentTime - this.lastTime;

    const currentPosition = this.getPositionX(event);

    const deltaX = currentPosition - this.currentX;


    this.velocity = deltaX / deltaTime;


    this.currentX = currentPosition;

    this.lastTime = currentTime;

    this.walkDistance = this.currentX - this.startX;


    const newTranslate = this.prevTranslate + this.walkDistance;

    const minTranslate = -(this.maxIndex * (this.itemWidth + this.gap));

    const maxTranslate = 0;


    if (newTranslate > maxTranslate) {

      this.currentTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;

    } else if (newTranslate < minTranslate) {

      this.currentTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;

    } else {

      this.currentTranslate = newTranslate;

    }

  }


  private animate(): void {

    if (this.isDragging) {

      this.setSliderPosition();

      this.animationID = requestAnimationFrame(() => this.animate());

    }

  }


  private setSliderPosition(): void {

    const track = this.sliderTrack.nativeElement;

    this.renderer.setStyle(track, 'transform', `translateX(${this.currentTranslate}px)`);

  }


  private getPositionX(event: MouseEvent | TouchEvent): number {

    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;

  }



  private startAutoplay(): void {
    if (this.autoplay) {
      this.autoplayTimer = setInterval(() => {
        if (!this.isDragging) {
          if (this.loop) {
            // Always slide to the next slide when in loop mode.
            this.slide('next');
          } else {
            // For non-loop mode, use the current check.
            if (this.currentIndex < this.maxIndex) {
              this.slide('next');
            } else {
              this.currentIndex = 0;
              this.updateSliderPosition();
            }
          }
        }
      }, this.autoplayInterval);
    }
  }


  private stopAutoplay(): void {

    if (this.autoplayTimer) {

      clearInterval(this.autoplayTimer);

    }

  }


  @HostListener('mouseenter')

  onMouseEnter(): void {

    this.stopAutoplay();

  }


  @HostListener('mouseleave')

  onMouseLeave(): void {

    if (this.autoplay) {

      this.startAutoplay();

    }

  }


  slide(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.currentIndex = this.loop
        ? this.currentIndex - 1
        : Math.max(0, this.currentIndex - 1);
    } else {
      this.currentIndex = this.loop
        ? this.currentIndex + 1
        : Math.min(this.maxIndex, this.currentIndex + 1);
    }
    this.updateSliderPosition(true);
  }


  goToPage(pageIndex: number): void {
    this.currentIndex = this.loop
      ? pageIndex * this.visibleSlides + this.visibleSlides
      : pageIndex * this.visibleSlides;
    this.updateSliderPosition();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    // Only handle horizontal wheel (deltaX)
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      // Here, you can move the swiper horizontally if you want
      // Example: this.slide(event.deltaX > 0 ? 'next' : 'prev');
      event.preventDefault();
    }
    // If vertical scroll, let it bubble up so the page scrolls
  }

}
