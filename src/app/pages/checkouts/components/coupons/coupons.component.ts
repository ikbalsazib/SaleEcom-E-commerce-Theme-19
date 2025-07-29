import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Coupon} from "../../../../interfaces/common/coupon.interface";
import {UiService} from "../../../../services/core/ui.service";
import {CouponService} from "../../../../services/common/coupon.service";
import {FilterData} from "../../../../interfaces/core/filter-data";
import {Subscription} from "rxjs";
import {User} from "../../../../interfaces/common/user.interface";
import {UserDataService} from "../../../../services/common/user-data.service";
import {UserService} from "../../../../services/common/user.service";
import {Cart} from "../../../../interfaces/common/cart.interface";
import {Product, VariationList} from "../../../../interfaces/common/product.interface";
import {PricePipe} from "../../../../shared/pipes/price.pipe";
import {DiscountTypeEnum} from "../../../../enum/product.enum";
import {CouponCardComponent} from '../../../../shared/components/coupon-card/coupon-card.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss',
  providers: [PricePipe],
  imports: [
    CouponCardComponent,
    FormsModule,
  ],
  standalone: true
})
export class CouponsComponent implements OnInit, OnDestroy {

  // Store Data
  coupon: Coupon = null;
  couponCode: any = null;
  couponDiscount: number = 0;
  isCoupon: boolean = false;
  isDown = false;
  startX = 0;
  scrollLeft = 0;
  container!: HTMLElement;
  allCoupons: Coupon[] = [];
  user: User;
  filter: any = null;
  carts: Cart[] = [];
  isPoint: boolean = true;

  // Inject
  private readonly uiService = inject(UiService);
  private readonly couponService = inject(CouponService);
  private readonly userDataService = inject(UserDataService);
  private readonly userService = inject(UserService);
  private readonly pricePipe = inject(PricePipe);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }
    // Base Data
    this.getAllCoupons();
  }


  get cartSubTotal(): number {
    return this.carts
      .map((data) => {
        if (
          (data?.product as Product)?.variationList &&
          (data?.product as Product)?.variationList?.length > 0
        ) {
          const variationListData = (
            data?.product as Product
          )?.variationList?.find(
            (f) => f?.name === (data?.variation as VariationList)?.name
          );
          return this.pricePipe.transform(
            variationListData,
            'salePrice',
            data?.selectedQty
          ) as number;
        } else {
          return this.pricePipe.transform(
            data?.product as Product,
            'salePrice',
            data?.selectedQty
          ) as number;
        }
      })
      .reduce((acc, value) => acc + value, 0);
  }

  onRemoveCoupon() {
    this.couponDiscount = 0;
    this.couponCode = null;
    this.coupon = null;
  }

  onMouseDown(event: MouseEvent) {
    this.isDown = true;
    this.container = event?.currentTarget as HTMLElement;
    this.startX = event?.pageX - this.container?.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
    this.container.style.cursor = 'grabbing';
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDown) return;
    event.preventDefault();
    const x = event.pageX - this.container?.offsetLeft;
    const walk = (x - this.startX) * 2; // Multiplied for faster scrolling
    this.container.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp() {
    this.isDown = false;
    this.container?.classList?.remove('grabbing');
  }

  onMouseLeave() {
    this.isDown = false;
    this.container?.classList?.remove('grabbing');
  }

  onChangeCouponCode(event: Coupon) {
    this.couponCode = event;
  }


  /**
   * HTTP REQUEST HANDLE
   * getLoggedInUserData()
   * getAllCoupons()
   * calculateCouponDiscount()
   * checkCouponAvailability()
   */

  private getLoggedInUserData() {
    const select = 'name addresses email phoneNo rewardPoints usedCoupons';
    const subscription = this.userDataService
      .getLoggedInUserData(select)
      .subscribe({
        next: (res) => {
          this.user = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private getAllCoupons() {
    const mSelect = {
      name: 1,
      couponCode: 1,
      bannerImage: 1,
      description: 1,
      startDateTime: 1,
      endDateTime: 1,
      createdAt: 1,
      discountType: 1,
      discountAmount: 1,
      minimumAmount: 1,
    };

    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: mSelect,
      sort: {createdAt: -1},
    };

    const subscription = this.couponService.getAllCoupons(filter, null).subscribe({
      next: (res) => {
        if (res.success) {
          this.allCoupons = res?.data?.filter(f => !this.user?.usedCoupons.includes(f?._id));
          if (this.allCoupons.length) {
            this.isCoupon = true
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions?.push(subscription);
  }

  private calculateCouponDiscount() {
    if (this.coupon.discountType === DiscountTypeEnum.PERCENTAGE) {
      this.couponDiscount = Math.floor(
        (this.coupon.discountAmount / 100) * this.cartSubTotal
      );
    } else {
      this.couponDiscount = Math.floor(this.coupon.discountAmount);
    }
  }

  public checkCouponAvailability() {

    if (!this.couponCode?.trim()) {
      this.uiService.message('Please enter your vouchers code.', "warn");
      return;
    }

    const subscription = this.couponService
      .checkCouponAvailability({
        couponCode: this.couponCode,
        subTotal: this.cartSubTotal,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.uiService.message(res.message, "success");
            this.coupon = res.data;
            this.isPoint = false;
            if (this.coupon) {
              this.calculateCouponDiscount();
            }
          } else {
            this.uiService.message(res.message, "warn");
          }
        },
        error: (error) => {
          console.log(error);
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
