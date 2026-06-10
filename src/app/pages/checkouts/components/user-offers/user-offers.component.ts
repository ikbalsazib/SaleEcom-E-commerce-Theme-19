import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {SettingService} from '../../../../services/common/setting.service';
import {Subscription} from 'rxjs';
import {PaymentCardLoaderComponent} from '../../../../shared/loader/payment-card-loader/payment-card-loader.component';
import {UserOffer} from '../../../../interfaces/common/setting.interface';
import {CurrencyCtrPipe} from '../../../../shared/pipes/currency.pipe';
import {OrderService} from '../../../../services/common/order.service';
import {FilterData} from '../../../../interfaces/core/filter-data';

@Component({
  selector: 'app-user-offers',
  templateUrl: './user-offers.component.html',
  styleUrl: './user-offers.component.scss',
  imports: [
    PaymentCardLoaderComponent
  ],
  standalone: true,
  providers: [CurrencyCtrPipe]
})
export class UserOffersComponent implements OnInit, OnDestroy {

  // Decorator
  @Input() cartSaleSubTotal: number = 0;
  @Output() onChangeUserDiscount = new EventEmitter<any>();

  // Store Data
  userOffers: UserOffer[] = [];
  isLoading: boolean = true;
  selectedOffer: UserOffer;

  // Inject
  private readonly settingService = inject(SettingService);
  private readonly currencyCtrPipe = inject(CurrencyCtrPipe);
  private readonly orderService = inject(OrderService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base Data
    this.getUserOffers();
  }


  /**
   * HTTP Req Handle
   * getPaymentMethod()
   */

  private getUserOffers() {
    const subscription = this.settingService.getUserOffers()
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.userOffers = res.data;
            if (this.userOffers.length) {
              const filterData: FilterData = {
                filter: null,
                pagination: { pageSize: 1, currentPage: 1 },
                select: { _id: 1 },
                sort: null
              };
              this.orderService.getAllOrder(filterData).subscribe({
                next: (orderRes) => {
                  this.isLoading = false;
                  const hasOrders = orderRes.data && orderRes.data.length > 0;
                  if (hasOrders) {
                    this.userOffers = this.userOffers.filter(f => f.offerType !== 'new-registration');
                  }
                  if (this.userOffers.length) {
                    const fNewUserOffer = this.userOffers.find(f => f.offerType === 'new-registration');
                    if (fNewUserOffer) {
                      this.selectedOffer = fNewUserOffer;
                      this.emitUserOfferDiscount();
                    }
                  }
                },
                error: (err) => {
                  this.isLoading = false;
                  console.log(err);
                  const fNewUserOffer = this.userOffers.find(f => f.offerType === 'new-registration');
                  if (fNewUserOffer) {
                    this.selectedOffer = fNewUserOffer;
                    this.emitUserOfferDiscount();
                  }
                }
              });
            } else {
              this.isLoading = false;
            }
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * UI LOGIC
   * getFilterPaymentMethods()
   * onSelectPaymentMethod()
   */

  onSelectPaymentMethod(data: any) {
    if (!this.selectedOffer) {
      this.selectedOffer = data;
    } else {
      if (this.selectedOffer.offerType === data.offerType) {
        this.selectedOffer = null;
      } else {
        this.selectedOffer = data;
      }
    }
    this.emitUserOfferDiscount()
  }

  getOfferName(offerType: string): string {
    if (offerType === 'new-registration') {
      return 'New Registration Offer'
    } else if (offerType === 'online-payment') {
      return 'Online Payment Offer'
    } else {
      return '';
    }
  }

  getOfferDiscountView(discount: string): string {
    if (!discount?.endsWith('%')) {
      return `${this.currencyCtrPipe.transform(Number(discount))}`;
    } else {
      return discount
    }
  }

  private getDiscountAmount() {
    if (this.selectedOffer) {
      const discount = this.selectedOffer.discount;
      let discountValue = 0;
      if (discount.endsWith('%')) {
        const percentage = parseFloat(discount.replace("%", ""));
        discountValue = (percentage / 100) * this.cartSaleSubTotal;
      } else {
        discountValue = parseFloat(discount);
      }
      // Ensure discount doesn't exceed subtotal
      return Math.min(discountValue, this.cartSaleSubTotal);
    } else {
      return 0;
    }

  }

  emitUserOfferDiscount(): void {
    const data: any = {
      name: this.getOfferName(this.selectedOffer?.offerType),
      offerType: this.selectedOffer?.offerType,
      amount: this.getDiscountAmount(),
    }
    this.onChangeUserDiscount.emit(data);
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
