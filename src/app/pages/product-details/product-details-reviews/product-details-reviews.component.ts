import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Product} from "../../../interfaces/common/product.interface";
import {Review} from "../../../interfaces/common/review.interface";
import {Subscription} from "rxjs";
import {ReviewService} from "../../../services/common/review.service";
import {Pagination} from "../../../interfaces/core/pagination";
import {FilterData} from "../../../interfaces/core/filter-data";
import {StarRatingViewComponent} from "../../../shared/components/star-rating-view/star-rating-view.component";
import {ProductRatingCardComponent} from "../../../shared/components/product-rating-card/product-rating-card.component";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ProductService} from "../../../services/common/product.service";

@Component({
  selector: 'app-product-details-reviews',
  templateUrl: './product-details-reviews.component.html',
  styleUrl: './product-details-reviews.component.scss',
  standalone: true,
  imports: [
    StarRatingViewComponent,
    ProductRatingCardComponent,
    RouterLink
  ]
})
export class ProductDetailsReviewsComponent implements OnInit, OnDestroy {

  // Decorator
  // @Input() product: Product
// Store Data
  slug?: string;
  product: Product;
  // Store Data
  allReviews: Review[] = [];
  totalReviews: number = 0;

  // Inject
  private readonly reviewService = inject(ReviewService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit(): void {
    // Param Map
    const subscription = this.activateRoute.paramMap.subscribe((param) => {
      this.slug = param.get('slug');
      if (this.slug) {
        this.getProductBySlug();
      }
    });
    this.subscriptions?.push(subscription);
    // Base Data

  }

  /**
   * HTTP Request Handle
   * getProductBySlug()
   * getRelatedProducts()
   * getAllCategory()
   * getAllBanners()
   */
  private getProductBySlug() {
    const subscription = this.productService
      .getProductBySlug(this.slug)
      .subscribe({
        next: res => {
          this.product = res.data;
          if (this.product) {
            this.getAllReviews();
          }
        },
        error: err => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * HTTP Req Handle
   * getAllReviews()
   */

  private getAllReviews() {
    const pagination: Pagination = {
      pageSize: 5,
      currentPage: 0
    };

    // Select
    const mSelect = {
      name: 1,
      user: 1,
      product: 1,
      review: 1,
      images: 1,
      rating: 1,
      status: 1,
      reviewDate: 1,
      reply: 1,
      replyDate: 1,
    }

    const filterData: FilterData = {
      pagination: pagination,
      filter: {'product._id': this.product?._id, 'status': true},
      select: mSelect,
      sort: {createdAt: -1}
    }

    const subscription = this.reviewService.getAllReviewsByProductId(filterData, null)
      .subscribe({
        next: res => {
          this.allReviews = res.data;
          this.totalReviews = res?.count;
        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }


  /**
   * Calculate
   * ratingCount()
   * getRatingPercentage()
   */
  get ratingCount(): number {
    if (this.product && this.product.ratingCount > 0) {
      return Math.floor((this.product.ratingTotal ?? 0) / this.product.ratingCount);
    } else {
      return 0;
    }
  }

  getRatingPercentage(starCount: number): number {
    if (starCount) {
      return Math.floor(starCount / this.product?.ratingCount * 100);
    } else {
      return 0;
    }
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
