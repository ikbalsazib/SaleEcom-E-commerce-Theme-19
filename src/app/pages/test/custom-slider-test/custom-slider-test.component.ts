import {AfterViewInit, Component, ElementRef, HostListener, inject, Input, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-custom-slider-test',
  templateUrl: './custom-slider-test.component.html',
  styleUrl: './custom-slider-test.component.scss',
  standalone: true,
})
export class CustomSliderTestComponent implements AfterViewInit{

  // Decorator
  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;
  @Input() items: any[] = [];
  @Input() itemsPerSlide: number = 3;
  @Input() groupMode: boolean = true;

  // Store Data
  currentIndex: number = 0;
  containerWidth: number = 0;
  sliding: boolean = false;

  // For dragging functionality
  dragging: boolean = false;
  startX: number = 0;

  private renderer = inject(Renderer2);

  ngAfterViewInit() {
    this.updateContainerWidth();
  }

  updateContainerWidth() {
    // Calculate the width of each item based on the container's width
    this.containerWidth = this.sliderContainer.nativeElement.offsetWidth / this.itemsPerSlide;
  }

  // Move to a specific slide
  slideTo(index: number) {
    // Ensure index is within bounds
    this.currentIndex = Math.max(0, Math.min(index, this.items.length - this.itemsPerSlide));

    const offset = -this.currentIndex * this.containerWidth;
    this.renderer.setStyle(this.sliderContainer.nativeElement, 'transform', `translateX(${offset}px)`);
  }

  // Move to the next slide
  nextSlide() {
    if (this.groupMode) {
      this.slideTo(this.currentIndex + this.itemsPerSlide);
    } else {
      this.slideTo(this.currentIndex + 1);
    }
  }

  // Move to the previous slide
  prevSlide() {
    if (this.groupMode) {
      this.slideTo(this.currentIndex - this.itemsPerSlide);
    } else {
      this.slideTo(this.currentIndex - 1);
    }
  }

  // Start dragging (touch or mouse)
  startDrag(event: MouseEvent | TouchEvent) {
    this.dragging = true;
    this.startX = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX);
  }

  // On dragging (move the slider)
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    const currentX = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX);
    const deltaX = currentX - this.startX;
    const offset = -this.currentIndex * this.containerWidth + deltaX;

    this.renderer.setStyle(this.sliderContainer.nativeElement, 'transform', `translateX(${offset}px)`);
  }

  // End dragging (apply the final slide transition)
  endDrag(event: MouseEvent | TouchEvent) {
    this.dragging = false;
    const endX = (event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX);
    const deltaX = endX - this.startX;

    if (Math.abs(deltaX) > this.containerWidth / 4) {
      if (deltaX < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    } else {
      this.slideTo(this.currentIndex);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateContainerWidth();
  }
}
