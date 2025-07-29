import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Carousel} from '../../../../interfaces/common/carousel.interface';
import {CarouselService} from '../../../../services/common/carousel.service';
import {ImageSliderComponent} from '../../../../shared/components/image-slider/image-slider.component';
import {CarouselComponent} from '../../../../shared/loader/carousel-loader/carousel-loader.component';
import {
  SmallAdvertiseComponent
} from '../../../../shared/components/showcases/small-advertise/small-advertise.component';

@Component({
  selector: 'app-showcase-1',
  templateUrl: './showcase-1.component.html',
  styleUrls: ['./showcase-1.component.scss'],
  standalone: true,
  imports: [
    ImageSliderComponent,
    CarouselComponent,
    SmallAdvertiseComponent
  ],
})

export class Showcase1Component implements OnInit, OnDestroy {

  // Store Data
  carousels: Carousel[] = [];
  isLoading: boolean = true;

  // Inject
  private readonly carouselService = inject(CarouselService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base Data
    this.getAllCarousel();
  }


  /**
   * HTTP Request Handle
   * getAllCarousel()
   */
  private getAllCarousel(): void {
    const subscription = this.carouselService.getAllCarousel()
      .subscribe({
        next: res => {
          this.carousels = res.data;
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
      });
    this.subscriptions?.push(subscription);
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
