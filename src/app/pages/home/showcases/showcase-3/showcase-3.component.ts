import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CarouselComponent} from "../../../../shared/loader/carousel-loader/carousel-loader.component";
import {ImageSliderComponent} from "../../../../shared/components/image-slider/image-slider.component";
import {Carousel} from "../../../../interfaces/common/carousel.interface";
import {CarouselService} from "../../../../services/common/carousel.service";
import {Subscription} from "rxjs";
import {Category} from "../../../../interfaces/common/category.interface";
import {CategoryService} from "../../../../services/common/category.service";
import {RouterLink} from "@angular/router";
import {
  ShowcaseThreeCategoryLoaderComponent
} from "../../../../shared/loader/showcase-three-category-loader/showcase-three-category-loader.component";

@Component({
  selector: 'app-showcase-3',
  standalone: true,
  imports: [
    CarouselComponent,
    ImageSliderComponent,
    RouterLink,
    ShowcaseThreeCategoryLoaderComponent
  ],
  templateUrl: './showcase-3.component.html',
  styleUrl: './showcase-3.component.scss'
})
export class Showcase3Component implements OnInit, OnDestroy {

  // Store Data
  carousels: Carousel[] = [];
  categories: Category [] = [];
  isLoading: boolean = true;

  // Inject
  private readonly carouselService = inject(CarouselService);
  private readonly categoryService = inject(CategoryService);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    // Base Data
    this.getAllCarousel();
    this.getAllCategory();
  }


  /**
   * HTTP Request Handle
   * getAllCarousel()
   * getAllCategory()
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

  private getAllCategory() {
    const subscription = this.categoryService.getAllCategory().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
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
