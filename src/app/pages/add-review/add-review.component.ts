import {Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OrderService} from "../../services/common/order.service";
import {ActivatedRoute} from "@angular/router";
import {Order} from "../../interfaces/common/order.interface";
import {Subscription} from "rxjs";
import {Product} from "../../interfaces/common/product.interface";
import {ProductService} from "../../services/common/product.service";
import {FormBuilder, FormGroup, NgForm, ReactiveFormsModule} from "@angular/forms";
import {UtilsService} from "../../services/core/utils.service";
import {Review} from "../../interfaces/common/review.interface";
import {UserService} from "../../services/common/user.service";
import {FileUploadService} from "../../services/gallery/file-upload.service";
import {UserDataService} from "../../services/common/user-data.service";
import {ReloadService} from "../../services/core/reload.service";
import {ReviewService} from "../../services/common/review.service";
import {User} from "../../interfaces/common/user.interface";
import {UiService} from "../../services/core/ui.service";
import {NgxDropzoneModule} from "ngx-dropzone";
import {AccountSidebarComponent} from "../../shared/components/account-sidebar/account-sidebar.component";
import {MatCard} from "@angular/material/card";
import {DropZoneModule} from "../../shared/components/drop-zone/drop-zone.module";
import {DatePipe} from "@angular/common";
import {MAX_IMAGE_UPLOAD} from "../../core/utils/app-data";

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.scss',
  standalone: true,
  imports: [
    NgxDropzoneModule,
    AccountSidebarComponent,
    ReactiveFormsModule,
    MatCard,
    DropZoneModule,
    DatePipe
  ]
})
export class AddReviewComponent implements OnInit, OnDestroy {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;

  // Store Data
  dataForm?: FormGroup;
  stars = [1, 2, 3, 4, 5];
  currentHover = 0;
  ratingText = '';
  fileNotPicked: boolean = false;
  id?: string;
  review?: Review | any;
  productId: string;
  orderId: string;
  order: Order | null = null;
  productData: Product | any;
  product: Product;
  user: User = null;
  rating = 0;
  deliveryExperienceRating = 0;
  maxImageUpload = MAX_IMAGE_UPLOAD

  // Image Upload
  files: File[] = [];
  oldImages: string[] = [];

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly userDataService = inject(UserDataService);
  private readonly reloadService = inject(ReloadService);
  private readonly utilsService = inject(UtilsService);
  private readonly reviewService = inject(ReviewService);
  private readonly uiService = inject(UiService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Init Form
    this.initDataForm();

    const subscription = this.activatedRoute.paramMap.subscribe(param => {
      this.id = param.get('id');
      if (this.id) {
        this.getReviewById()
      }
    })
    this.subscriptions?.push(subscription);

    this.activatedRoute.queryParamMap.subscribe(qParam => {
      this.orderId = qParam.get('orderId')
      this.productId = qParam.get('productId')
      if (this.orderId) {
        this.getOrderByIds();
      }
      if (this.productId) {
        this.getProductByUserById()
      }
    })
    if (this.userService.isUser) {
      this.getLoggedInUserInfo();
    }
  }

  /**
   * FORM METHODS
   * initDataForm()
   * onSubmit()
   */

  private initDataForm() {
    this.dataForm = this.fb.group({
      product: [null],
      name: [null],
      review: [null],
      rating: [null],
      deliveryExperienceRating: [null],
      reviewDate: [null],
      replyDate: [null],
      status: [false],
      like: 0,
      dislike: 0,
      images: null,
      deliveryExperience: null,
    });
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Please filed all the required field', "warn");
      return;
    }
    if (!this.rating && this.rating <= 0) {

      this.uiService.message('Please select your review', "warn");
      return;
    }

    if (this.review) {
      if (this.files && this.files.length) {
        this.updateReviewWithImage();
      } else {
        this.updateReview();
      }
    } else {
      if (this.files && this.files.length) {
        this.addReviewWithImage();
      } else {
        this.addReview();
      }
    }
  }


  /**
   * HTTP REQUEST HANDLE
   * addReviewWithImage()
   * updateReviewWithImage()
   * addReview()
   * updateReview()
   */

  private addReviewWithImage() {
      const subscription = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        this.dataForm.patchValue({images: images});
        this.addReview();
      });
      this.subscriptions?.push(subscription);
  }

  private updateReviewWithImage() {
    const subscription = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        this.dataForm.patchValue({ images: this.id ? [...images, ...this.oldImages] : images});
        this.updateReview();
      });
    this.subscriptions?.push(subscription);
  }

  private addReview() {
    const mData = {
      ...this.dataForm.value,
      ...{
        rating: this.rating,
        deliveryExperienceRating: this.deliveryExperienceRating,
        reviewDate: this.utilsService.getDateString(new Date()),
        product: this.productId,
        orderId: this.order?.orderId,
        order_Id: this.order?._id,
      }
    }
    const subscription = this.reviewService.addReview(mData)
      .subscribe({
        next: (res => {
          this.uiService.message('Your review is under process', "success");
          this.reloadService.needRefreshData$();
          this.dataForm.reset();
          this.files = [];
          this.rating = 0
          this.deliveryExperienceRating = 0
        }),
        error: (error => {
          console.log(error);
        })
      });
    this.subscriptions?.push(subscription);
  }

  private updateReview(): void {
    if (!this.review) return;

    const updatedReview = {
      ...this.dataForm.value,
      _id: this.review._id,
      rating: this.rating,
      deliveryExperienceRating: this.deliveryExperienceRating,
      reviewDate: this.utilsService.getDateString(new Date()),
      product: this.review.product,
      orderId: this.review?.orderId,
      order_Id: this.review?.order_Id,
      status: this.review?.status,
    };
    this.reviewService.updateReview(updatedReview).subscribe({
      next: (res) => this.uiService.message(res.message, "success"),
      error: (err) => console.error("Error updating review:", err),
    });
  }


  /**
   * HTTP Request Handle
   * getLoggedInUserInfo()
   * getOrderByIds()
   * getProductByUserById()
   * getReviewById()
   **/

  private getLoggedInUserInfo(): void {
    const subscription = this.userDataService.getLoggedInUserData().subscribe({
      next: (res) => {
        if (res?.data) {
          this.user = res.data;
          this.dataForm.patchValue(this.user);
        }
      },
      error: (err) => console.error("Error fetching user info:", err),
    });
    this.subscriptions?.push(subscription);
  }

  private getOrderByIds(): void {
    this.orderService.getOrderByIds(this.orderId)
      .subscribe({
        next: (res) => {
          this.order = res.data;
          this.productData = this.order?.orderedItems?.find(f => f?._id === this.productId)
        },
        error: (err) => {
          console.error('Error fetching order:', err);
        }
      });
  }

  private getProductByUserById() {
    const subscription = this.productService
      .getProductByUserById(this.productId)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.product = res.data;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private getReviewById() {
    const subscription = this.reviewService
      .getReviewById(this.id)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.review = res.data;
            if (this.review) {
              this.dataForm.patchValue(this.review)
              if (this.review.images) {
                this.oldImages = this.review?.images
              }
              this.rating = this.review?.rating
              this.deliveryExperienceRating = this.review?.deliveryExperienceRating
            }
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  onDeleteOldImage(event: any) {
    this.oldImages = event;
  }

  rate(value: number): void {
    this.rating = value;
    this.updateRatingText();
  }

  hover(value: number): void {
    this.currentHover = value;
  }

  updateRatingText(): void {
    const texts = ['Poor', 'Fair', 'Good', 'Very Good', 'Delightful'];
    this.ratingText = texts[this.rating - 1] || '';
  }

  /**
   * IMAGE UPLOAD
   * onSelect()
   */

  onSelect(event: any[]) {
    this.files = event;
    this.fileNotPicked = false;
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
