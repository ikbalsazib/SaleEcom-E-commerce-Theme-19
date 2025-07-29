import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Wishlist } from "../../../interfaces/common/wishlist.interface";
import { Router, RouterLink } from "@angular/router";
import { PricePipe } from "../../pipes/price.pipe";
import { Cart } from "../../../interfaces/common/cart.interface";
import { CartService } from "../../../services/common/cart.service";
import { UserService } from "../../../services/common/user.service";
import { UiService } from "../../../services/core/ui.service";
import { ReloadService } from "../../../services/core/reload.service";
import { Subscription } from "rxjs";
import { Product } from "../../../interfaces/common/product.interface";
import { AddToCartComponent } from "./add-to-cart/add-to-cart.component";
import {NewWishlistService} from "../../../services/common/new-wishlist.service";
import {CurrencyCtrPipe} from '../../pipes/currency.pipe';

@Component({
  selector: 'app-wishlist-card',
  standalone: true,
  imports: [
    RouterLink,
    PricePipe,
    AddToCartComponent,
    CurrencyCtrPipe
  ],
  templateUrl: './wishlist-card.component.html',
  styleUrl: './wishlist-card.component.scss'
})
export class WishlistCardComponent implements OnInit, OnDestroy {

  // Decorator
  @Input() wishlist: Wishlist;

  // Store Data
  cart: any = null;
  carts: Cart[] = [];
  isPopupVisible: boolean = false;

  // Inject
  private readonly cartService = inject(CartService);
  private readonly newWishlistService = inject(NewWishlistService);
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);

  // Subscription
  private subscriptions: Subscription[] = [];

  /**
   * Angular Lifecycle Hooks
   */
  ngOnInit() {
    this.initCartEvents();
  }

  /**
   * HTTP Request Handle
   * initCartEvents()
   */
  private initCartEvents() {
    const subscription = this.cartService.refreshStoredCart$.subscribe({
      next: () => {
        this.carts = this.cartService.cartItems;
        this.checkCartList();
      }
    });
    this.subscriptions?.push(subscription);
    this.carts = this.cartService.cartItems;
    this.checkCartList();
  }

  /**
   * Other Methods
   * checkCartList()
   */
  private checkCartList() {
    this.cart = this.carts.find(f => (f?.product as Product)?._id === this.wishlist?.product?._id);
  }

  /**
   * FORM METHODS
   * openPopup()
   * closePopup()
   */
  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  /**
   * Button Click Event Handle
   * onAddToCart()
   * addToCartDB()
   * onAddToWishList()
   */
  onAddToCart(event: MouseEvent) {
    event.stopPropagation();

    if (this.wishlist?.product?.isVariation) {
      this.openPopup();
    } else {
      const data: Cart | any = {
        product: this.wishlist?.product?._id,
        selectedQty: 1,
        isSelected: true,
      };
      if (this.userService.isUser) {
        this.addToCartDB(data, '');
      } else {
        this.cartService.addCartItemToLocalStorage(data);
        this.reloadService.needRefreshCart$(true);
        this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
      }
    }
  }

  private addToCartDB(data: Cart, url?: string) {
    const subscription = this.cartService.addToCart(data).subscribe({
      next: () => {
        this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
        this.removeWishlistById(this.wishlist?._id);
        this.reloadService.needRefreshCart$(true);
        this.cartService.needRefreshStoredCart$();

        if (url) {
          this.router.navigate([url]).then();
        }
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * COMPONENT DIALOG
   * removeWishlistById()
   */
  public removeWishlistById(wishlistId: any) {
    this.newWishlistService.newDeleteWishlistById(wishlistId);
  }

  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
