import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PricePipe} from '../../pipes/price.pipe';
import {DatePipe} from '@angular/common';
import {Cart} from '../../../interfaces/common/cart.interface';
import {CART_MAX_QUANTITY} from '../../../core/utils/app-data';
import {FormsModule} from '@angular/forms';
import {OnlyNumberDirective} from '../../directives/number-only.directive';
import {CurrencyCtrPipe} from '../../pipes/currency.pipe';
import {ProductPricePipe} from '../../pipes/product-price.pipe';
import {UserService} from "../../../services/common/user.service";
import {CartService} from "../../../services/common/cart.service";
import {ReloadService} from "../../../services/core/reload.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-order-item-card-mobile',
  templateUrl: './order-item-card-mobile.component.html',
  styleUrl: './order-item-card-mobile.component.scss',
  imports: [
    FormsModule,
    OnlyNumberDirective,
    CurrencyCtrPipe,
    ProductPricePipe,
  ],
  standalone: true,
  providers: [PricePipe, DatePipe],
})
export class OrderItemCardMobileComponent implements OnInit, OnDestroy {
  // Decorator
  @Input() data: Cart;
  @Output() private onIncrementCartQty = new EventEmitter<string>();
  @Output() private onDecrementCartQty = new EventEmitter<string>();

  // Store Data
  readonly cartMaxQuantity: number = CART_MAX_QUANTITY;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Inject
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly reloadService = inject(ReloadService);

  ngOnInit() {
    const subscription = this.reloadService.refreshCart$.subscribe(isRefresh => {
      if (isRefresh) {
        this.data
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Cart Methods
   * onIncrementQty()
   * onDecrementQty()
   */
  onIncrementQty(cartId: string) {
    this.onIncrementCartQty.emit(cartId);
  }

  onDecrementQty(cartId: string) {
    this.onDecrementCartQty.emit(cartId);
  }

  onDeleteSingleCartItem(item: any) {
    if (this.userService.isUser) {
      this.cartService.deleteCartById(item._id).subscribe({
        next: () => {

          this.reloadService.needRefreshCart$(true);
        },
        error: (error) => {
          console.error('Error deleting cart item:', error);
        },
      });
    } else {
      // For guest users, delete from local storage
      this.cartService.deleteCartItemFromLocalStorage([item.product._id]);

      this.reloadService.needRefreshCart$(true);
    }
  }

  getProductImage(item: any): string {
    return item?.variation?.image || item?.product?.images?.[0] || 'https://cdn.saleecom.com/upload/images/placeholder.png';
  }
  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
