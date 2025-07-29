import {Component, inject, Input, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Cart} from '../../../../../../interfaces/common/cart.interface';
import {UserService} from '../../../../../../services/common/user.service';
import {CartService} from '../../../../../../services/common/cart.service';
import {Subscription} from 'rxjs';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {UtilsService} from '../../../../../../services/core/utils.service';
import {NgClass,} from '@angular/common';
import {Product} from "../../../../../../interfaces/common/product.interface";
import {ReloadService} from "../../../../../../services/core/reload.service";
import {ProductPricePipe} from '../../../../../pipes/product-price.pipe';
import {VariationInfoInlinePipe} from '../../../../../pipes/variation-info-inline.pipe';
import {EmptyDataComponent} from "../../../../ui/empty-data/empty-data.component";
import {CurrencyCtrPipe} from '../../../../../pipes/currency.pipe';
import {TranslatePipe} from "../../../../../pipes/translate.pipe";

@Component({
  selector: 'app-header-cart-1',
  templateUrl: './header-cart-1.component.html',
  styleUrl: './header-cart-1.component.scss',
  imports: [
    RouterLink,
    NgClass,
    ProductPricePipe,
    VariationInfoInlinePipe,
    EmptyDataComponent,
    CurrencyCtrPipe,
    TranslatePipe,
  ],
  providers: [ProductPricePipe],
  standalone: true
})
export class HeaderCart1Component implements OnInit, OnDestroy {

  // Store Data
  @Input() carts: Cart[] = [];
  carts1: Cart[] = [];
  @Input() cartAnimate: boolean = false;
  currentUrl: string;

  // Inject
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly productPricePipe = inject(ProductPricePipe);
  private readonly reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    this.initRouteEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {

  }


  /**
   * Router Methods
   * initRouteEvent()
   */
  private initRouteEvent() {
    const subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.utilsService.removeUrlQuery(event.urlAfterRedirects);
      }
    });
    this.subscriptions?.push(subscription);
  }


  /**
   * Cart Methods
   * onDeleteCartItem()
   * deleteCartById()
   */
  onDeleteCartItem(cartId: string, productId?: string) {
    if (this.userService.isUser) {
      this.deleteCartById(cartId);
    } else {
      this.cartService.deleteCartItemFromLocalStorage([productId]);
      // Update Cart Before API Calls
      this.carts = this.carts.filter(cart => cart._id !== cartId);
      this.reloadService.needRefreshCart$(true);
    }
  }

  deleteCartById(cartId: string) {
    // Update Cart Before API Calls
    this.carts = this.carts.filter(cart => cart._id !== cartId);
    const subscription = this.cartService.deleteCartById(cartId)
      .subscribe({
        next: () => {
          this.reloadService.needRefreshCart$(true);
        },
        error: error => {
          console.log(error)
        }
      });

    this.subscriptions?.push(subscription);
  }

  /**
   * Calculation
   * cartSubTotal()
   */

  get cartSubTotal(): number {
    return this.carts
      .map((t) => {
        return this.productPricePipe.transform(
          t.product as Product,
          'regularPrice',
          null,
          t.selectedQty
        ) as number;
      })
      .reduce((acc, value) => acc + value, 0);
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
