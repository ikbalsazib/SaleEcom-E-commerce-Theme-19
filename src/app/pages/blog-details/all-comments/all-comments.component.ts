import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Review} from "../../../interfaces/common/review.interface";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Pagination} from "../../../interfaces/core/pagination";
import {Product} from "../../../interfaces/common/product.interface";
import {FilterData} from "../../../interfaces/core/filter-data";
import {LightgalleryModule} from "lightgallery/angular";
import {ImageLoadErrorDirective} from "../../../shared/directives/image-load-error.directive";
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {CommentService} from "../../../services/common/comment.service";
import {ShopInformationService} from "../../../services/common/shop-information.service";
import {ShopInformation} from "../../../interfaces/common/shop-information.interface";
import {ImgCtrlPipe} from "../../../shared/pipes/img-ctrl.pipe";

@Component({
  selector: 'app-all-comments',
  templateUrl: './all-comments.component.html',
  styleUrls: ['./all-comments.component.scss'],
  standalone: true,
  imports: [
    LightgalleryModule,
    ImageLoadErrorDirective,
    NgForOf,
    NgIf,
    DatePipe,
    ImgCtrlPipe,
    NgOptimizedImage
  ]
})
export class AllCommentsComponent implements OnInit, OnDestroy {

  @Input() data:any;
  // Store data
  slug?: string;
  product: Product | any;
  allReviews: Review[] = [];
  shopInfo: ShopInformation;

  // Subscriptions
  private subRouteParam: Subscription;
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  constructor(
    private activateRoute: ActivatedRoute,
    private commentService: CommentService,
    private shopInfoService: ShopInformationService,
  ) {
  }

  ngOnInit(): void {
    // get activated route
    this.subRouteParam = this.activateRoute.paramMap.subscribe(param => {
      this.slug = param.get('slug');
      if (this.slug) {
        this.getAllReviews();
      }
    });

  // this.getAllReviews();

  }

  /**
   * HTTP REQUEST HANDLE
   * getProductBySlug()
   * getAllReviews()
   *
   */



  private getAllReviews() {
    const pagination: Pagination = {
      pageSize: 12,
      currentPage: 0
    };

    // Select
    const mSelect = {
      name: 1,
      user: 1,
      blog: 1,
      review: 1,
      images: 1,
      profileImg:1,
      rating: 1,
      status: 1,
      reviewDate: 1,
      reply: 1,
      replyDate: 1,
    }

    const filterData: FilterData = {
      pagination: pagination,
      filter: { 'blog.slug': this.slug, status: 'publish' },
      select: mSelect,
      sort: { createdAt: -1 }
    }

    this.subDataTwo = this.commentService.getAllReviewsByQuery(filterData, null)
      .subscribe(res => {
        this.allReviews = res.data;
        this.getShopInfo();
      }, error => {
        console.log(error);
      });

  }


  /**
   * HTTP REQUEST CONTROLL
   * addNewsLetter()
   * getShopInfo()
   */

  private getShopInfo() {
    const subscription = this.shopInfoService.getShopInformation() .subscribe({
      next: res => {
        this.shopInfo = res.data;
      },
      error: err => {
        console.error(err);
      }
    });
  }
  /**
   * NG ON DESTROY
   */
  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
    if (this.subDataTwo) {
      this.subDataTwo.unsubscribe();
    }
    if (this.subRouteParam) {
      this.subRouteParam.unsubscribe();
    }
  }


}
