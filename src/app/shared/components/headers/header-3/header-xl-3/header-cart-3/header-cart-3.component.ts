import {Component, inject, Input, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Cart} from "../../../../../../interfaces/common/cart.interface";
import {UserService} from "../../../../../../services/common/user.service";
import {CartService} from "../../../../../../services/common/cart.service";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {UtilsService} from "../../../../../../services/core/utils.service";
import {ProductPricePipe} from "../../../../../pipes/product-price.pipe";
import {ReloadService} from "../../../../../../services/core/reload.service";
import {Subscription} from "rxjs";
import {Product} from "../../../../../../interfaces/common/product.interface";
import {NgClass, NgIf} from "@angular/common";
import {VariationInfoInlinePipe} from "../../../../../pipes/variation-info-inline.pipe";
import {TranslatePipe} from "../../../../../pipes/translate.pipe";
import {CurrencyCtrPipe} from "../../../../../pipes/currency.pipe";
import {EmptyDataComponent} from "../../../../ui/empty-data/empty-data.component";

@Component({
  selector: 'app-header-cart-3',
  templateUrl: './header-cart-3.component.html',
  styleUrl: './header-cart-3.component.scss',
  imports: [
    RouterLink,
    NgClass,
    VariationInfoInlinePipe,
    ProductPricePipe,
    TranslatePipe,
    CurrencyCtrPipe,
    EmptyDataComponent,
    NgIf
  ],
  standalone: true,
  providers: [ProductPricePipe],
})
export class HeaderCart3Component implements OnInit, OnDestroy {

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
