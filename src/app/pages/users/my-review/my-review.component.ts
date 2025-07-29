import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Order} from '../../../interfaces/common/order.interface';
import {Review} from "../../../interfaces/common/review.interface";
import {ReviewService} from "../../../services/common/review.service";
import {Pagination} from "../../../interfaces/core/pagination";
import {FilterData} from "../../../interfaces/core/filter-data";
import {Subscription} from "rxjs";
import {UiService} from "../../../services/core/ui.service";
import {ReloadService} from "../../../services/core/reload.service";
import {ConfirmDialogComponent} from "../../../shared/dialog/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {isPlatformBrowser, NgClass} from "@angular/common";
import {AccountSidebarComponent} from "../../../shared/components/account-sidebar/account-sidebar.component";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {PendingReviewComponent} from "../../pending-review/pending-review.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-my-review',
  templateUrl: './my-review.component.html',
  styleUrl: './my-review.component.scss',
  standalone: true,
  imports: [
    AccountSidebarComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PendingReviewComponent,
    NgClass,
    RouterLink
  ]
})
export class MyReviewComponent implements OnInit, OnDestroy {

  // Store Data
  selectedStatus: string = 'Pending Review';
  order: Order[] = [];
  allReviews: Review[] = [];
  allPendingReviews: any;
  filter: any = null;
  reviewId: string;

  // Pagination
  currentPage = 1;
  productsPerPage = 5;


  // Inject
  private readonly reviewService = inject(ReviewService);
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);
  private readonly dialog = inject(MatDialog);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    const subscription = this.reloadService.refreshData$.subscribe(() => {
      this.getAllReviews();
    });
    this.subscriptions?.push(subscription);

    // Load pending reviews if browser
    if (isPlatformBrowser(this.platformId)) {
      this.getAllPendingReviews();
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllReviews()
   * getAllPendingReviews()
   */
  private getAllReviews() {
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
      filter: this.filter,
      select: mSelect,
      sort: { createdAt: -1 }
    };

    const subscription = this.reviewService.getAllReviewsByQuery(filterData, null)
      .subscribe({
        next: res => {
          this.allReviews = res.data;
        },
        error: err => {}
      });
    this.subscriptions?.push(subscription);
  }

  private getAllPendingReviews() {
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
      filter: this.filter,
      select: mSelect,
      sort: { createdAt: -1 }
    };

    const subscription = this.reviewService.getAllPendingReviewsByQuery()
      .subscribe({
        next: res => {
          this.allPendingReviews = res.data;
        },
        error: err => {}
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * OTHER METHODS
   * selectStatus()
   * getRatingArray()
   */
  selectStatus(status: string) {
    this.selectedStatus = status;

    if (status === 'My Review') {
      this.getAllReviews();
    } else {
      this.getAllPendingReviews();
    }
  }

  getRatingArray(rating: number): boolean[] {
    const maxRating = 5;
    return Array.from({ length: maxRating }, (_, i) => i < rating);
  }

  /**
   * COMPONENT DIALOG
   * openConfirmDialog()
   */
  public openConfirmDialog(data?: string) {
    this.reviewId = data;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this review?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteReviewByReviewId();
      }
    });
  }

  /**
   * DELETE METHOD
   * deleteReviewByReviewId()
   */
  private deleteReviewByReviewId() {
    this.reviewService.deleteReviewByReviewId(this.reviewId)
      .subscribe({
        next: res => {
          this.uiService.message(res.message, "success");
          this.reloadService.needRefreshData$();
        },
        error: err => {}
      });
  }

  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
