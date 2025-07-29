import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {ShopInformation} from "../../../../../interfaces/common/shop-information.interface";
import {isPlatformBrowser, NgClass} from "@angular/common";
import {CartService} from "../../../../../services/common/cart.service";
import {ProductPricePipe} from "../../../../pipes/product-price.pipe";
import {ReloadService} from "../../../../../services/core/reload.service";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user.service";
import {Cart} from "../../../../../interfaces/common/cart.interface";
import {ProductService} from "../../../../../services/common/product.service";
import {Product} from "../../../../../interfaces/common/product.interface";
import {CurrencyCtrPipe} from "../../../../pipes/currency.pipe";

@Component({
  selector: 'app-bottom-navbar4',
  templateUrl: './bottom-navbar4.component.html',
  styleUrl: './bottom-navbar4.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgClass,
    CurrencyCtrPipe
  ],
  providers: [ProductPricePipe],
})
export class BottomNavbar4Component {
  // Decorator
  @Input() currentUrl: string;
  @Input() shopInfo: ShopInformation;
  @Input() chatLink: any;
  // Store Data
  carts: Cart[] = [];
  // Store Data
  chatStyle: boolean = false;
  private readonly cartService = inject(CartService);
  private readonly productPricePipe = inject(ProductPricePipe);
  private readonly reloadService = inject(ReloadService);
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productService = inject(ProductService);
  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    // Reload Data
    const subscription = this.reloadService.refreshCart$.subscribe(isRefresh => {
      if (isRefresh) {
        this.getCartsItems(isRefresh);
      }
    });
    this.subscriptions?.push(subscription);

    // Base Data
    if (isPlatformBrowser(this.platformId)) {
      this.getCartsItems();
    }

  }

  /**
   * HTTP Request Handle
   * getCartsItems()
   * getCarsItemFromLocal()
   * getWishlistItems()
   **/
  private getCartsItems(refresh?: boolean) {
    if (this.userService.isUser) {
      const subscription = this.cartService.getCartByUser()
        .subscribe({
          next: res => {
            this.carts = res.data;
            this.cartService.updateCartList(this.carts);
          },
          error: error => {
            console.log(error)
          }
        });
      this.subscriptions?.push(subscription);
    } else {
      this.getCarsItemFromLocal(refresh);
    }
  }


  private getCarsItemFromLocal(refresh?: boolean) {
    const items = this.cartService.getCartItemFromLocalStorage();

    if (items && items.length) {
      const ids: string[] = items.map((m) => m.product as string);
      const select =
        'name slug salePrice regularPrice images quantity category isVariation variationList minimumWholesaleQuantity wholesalePrice';
      const subscription = this.productService.getProductByIds(ids, select)
        .subscribe({
          next: res => {
            const products = res.data;
            this.removeUnnecessaryCartItems(products, ids);
            if (products && products.length) {
              this.carts = items.map(t1 => ({
                ...t1,
                ...{product: products.find((t2) => t2._id === t1.product)},
              }));
              this.cartService.updateCartList(this.carts);
            }
          },
          error: error => {
            console.log(error)
          }
        });
      this.subscriptions?.push(subscription);
    } else {
      this.carts = [];
      this.cartService.updateCartList(this.carts);
    }
  }
  private removeUnnecessaryCartItems(products: any[], ids: string[]) {
    if (!this.userService.isUser) {
      const productIds = products.map(product => product._id);
      const notExistsIds = ids.filter(id => !productIds.includes(id));
      if (notExistsIds.length) {
        this.cartService.deleteCartItemFromLocalStorage(notExistsIds);
        this.reloadService.needRefreshCart$(true);
      }

    }
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
  /**
   * Other Methods
   * isVisible
   * getSocialLink()
   * onClick()
   * chatOpen()
   **/
  get isVisible() {
    return (
      !['/cart', '/checkout', '/easy-checkout'].includes(this.currentUrl) &&
      !this.currentUrl.startsWith('/product-details/')
    );
  }


  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.chat')) {
      this.chatStyle = false;
    }
  }

  chatOpen() {
    this.chatStyle = !this.chatStyle;
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : 'auto';
  }
}
