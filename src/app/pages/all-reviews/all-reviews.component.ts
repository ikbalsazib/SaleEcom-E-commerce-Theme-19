import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Review} from "../../interfaces/common/review.interface";
import {Subscription} from "rxjs";
import {ReviewService} from "../../services/common/review.service";
import {ReloadService} from "../../services/core/reload.service";
import {Pagination} from "../../interfaces/core/pagination";
import {FilterData} from "../../interfaces/core/filter-data";
import {ActivatedRoute, Router} from "@angular/router";
import {Product} from "../../interfaces/common/product.interface";
import {ProductService} from "../../services/common/product.service";
import {GalleryImageViewerComponent} from "../../shared/components/gallery-image-viewer/gallery-image-viewer.component";
import {DatePipe, NgSwitch, NgSwitchCase} from "@angular/common";

@Component({
  selector: 'app-all-reviews',
  templateUrl: './all-reviews.component.html',
  styleUrl: './all-reviews.component.scss',
  standalone: true,
  imports: [
    GalleryImageViewerComponent,
    NgSwitch,
    DatePipe,
    NgSwitchCase
  ]
})
export class AllReviewsComponent implements OnInit, OnDestroy {

  // Store Data
  stars: string[] = [];
  allReviews: Review[] = [];
  ratingTotalData: any;
  ratingData: any;
  ratingCalculation: any;
  filter: any = null;
  productId: string;
  product: Product;
  ratingDetails:any;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  isLoadMore = false;
  isGalleryOpen: boolean = false;

  // Pagination
  currentPage = 1;
  totalReviews = 0;
  productsPerPage = 5;
  totalProductsStore = 0;

  // Subscription
  private subscriptions: Subscription[] = [];

  // Inject
  private readonly reviewService = inject(ReviewService);
  private readonly reloadService = inject(ReloadService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);


  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(qParam => {
      this.productId = qParam.get('productId')
      if (this.productId) {
        this.getAllReviews();
        this.getProductByUserById()
      }
    })
    this.reloadService.refreshData$
      .subscribe(() => {
        this.getAllReviews();
      });
  }

  // Calculate the percentage width of each bar
  getPercentage(starCount: number): string {
    return '20%';
  }

  generateStars(): void {
    this.stars = [];
    const fullStars = Math.floor(this.ratingCalculation);
    const halfStars = this.ratingCalculation % 1 >= 0.1 && this.ratingCalculation % 1 <= 0.9 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    // Push full stars
    for (let i = 0; i < fullStars; i++) {
      this.stars.push('full');
    }

    // Push half star if needed
    if (halfStars === 1) {
      this.stars.push('half');
    }

    // Push empty stars
    for (let i = 0; i < emptyStars; i++) {
      this.stars.push('empty');
    }
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  openGallery(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.isGalleryOpen = true;
    this.router.navigate([], {queryParams: {'gallery-image-view': true}, queryParamsHandling: 'merge'}).then();
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.router.navigate([], {queryParams: {'gallery-image-view': null}, queryParamsHandling: 'merge'}).then();
  }


  /**
   * LOAD MORE
   */
  onLoadMore() {
    if (this.totalReviews > this.allReviews.length) {
      this.isLoadMore = true;
      this.currentPage += 1;
      this.getAllReviews(true);
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllReviews()
   * getProductByUserById()
   */
  private getAllReviews(loadMore?: boolean) {
    const pagination: Pagination = {
      pageSize: Number(this.productsPerPage),
      currentPage: Number(this.currentPage) - 1
    };

    const mSelect = {
      name: 1, user: 1, product: 1, review: 1, images: 1,
      rating: 1, status: 1, reviewDate: 1, reply: 1, replyDate: 1,
      createdAt: 1, orderId: 1, order_Id: 1
    };

    const filterData: FilterData = {
      pagination: pagination,
      filter: { status: true, 'product._id': this.productId },
      select: mSelect,
      sort: { createdAt: -1 }
    };

    const subscription = this.reviewService.getAllReviewsByProductId(filterData, null)
      .subscribe({
        next: (res) => {
          setTimeout(() => { this.isLoadMore = false; }, 500);
          this.allReviews = loadMore ? [...this.allReviews, ...res.data] : res.data;
          this.totalReviews = res?.count;
        },
        error: () => {}
      });
    this.subscriptions.push(subscription);
  }

  private getProductByUserById() {
    const subscription = this.productService
      .getProductByUserById(this.productId)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.product = res.data;
            this.ratingTotalData = this.product?.ratingTotal;
            this.ratingData = this.product?.ratingCount;
            this.ratingCalculation = (this.ratingData / this.ratingTotalData);
            if (this.ratingCalculation){
              this.generateStars();
            }
            if (this.product?.ratingDetails){
              this.ratingDetails= this.product?.ratingDetails;
            }
          }
        },
        error: (err) => {
          console.log(err);
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
