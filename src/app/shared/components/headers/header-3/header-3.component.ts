import {Component, inject, Input, OnDestroy, OnInit, PLATFORM_ID, Signal} from '@angular/core';
import {Cart} from "../../../../interfaces/common/cart.interface";
import {ShopInformation} from "../../../../interfaces/common/shop-information.interface";
import {Category} from "../../../../interfaces/common/category.interface";
import {ReloadService} from "../../../../services/core/reload.service";
import {UserService} from "../../../../services/common/user.service";
import {CartService} from "../../../../services/common/cart.service";
import {NewWishlistService} from "../../../../services/common/new-wishlist.service";
import {ProductService} from "../../../../services/common/product.service";
import {ShopInformationService} from "../../../../services/common/shop-information.service";
import {ChildCategoryService} from "../../../../services/common/child-category.service";
import {Wishlist} from "../../../../interfaces/common/wishlist.interface";
import {Subscription} from "rxjs";
import {isPlatformBrowser} from "@angular/common";
import {HeaderSm3Component} from "./header-sm-3/header-sm-3.component";
import {HeaderXl3Component} from "./header-xl-3/header-xl-3.component";

@Component({
  selector: 'app-header-3',
  templateUrl: './header-3.component.html',
  styleUrl: './header-3.component.scss',
  imports: [
    HeaderSm3Component,
    HeaderXl3Component
  ],
  standalone: true
})
export class Header3Component implements OnInit, OnDestroy {

  // Decorator
  @Input() currentUrl: string;

  // Store Data
  carts: Cart[] = [];
  cartAnimate: boolean = false
  wishlistAnimate: boolean = false
  shopInfo: ShopInformation;
  categories: Category[] = [];
  isLoading: boolean = true;
  toggleStyle: boolean = false;
  isShow = false;

  // Inject
  private readonly reloadService = inject(ReloadService);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly newWishlistService = inject(NewWishlistService);
  private readonly productService = inject(ProductService);
  private readonly shopInfoService = inject(ShopInformationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly childCategoryService = inject(ChildCategoryService);

  // Wishlist Signal
  wishlists: Signal<Wishlist[]> = this.newWishlistService.newWishlistItems;

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
      this.getShopInfo();
    }
    if (this.userService.getUserStatus()) {
      this.getWishlistItems();
    }
    // Base Data
    this.getAllChildCategory();
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
            if (refresh) {
              this.cartAnimate = true;
              setTimeout(() => {
                if (this.cartAnimate == true) {
                  this.cartAnimate = false;
                }
              }, 1000);
            }
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
              if (refresh) {
                this.cartAnimate = true;
                setTimeout(() => {
                  if (this.cartAnimate == true) {
                    this.cartAnimate = false;
                  }
                }, 1000);
              }
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


  private getWishlistItems() {
    if (this.userService.isUser) {
      this.newWishlistService.newGetWishlistByUser();
    }
  }

  /**
   * HTTP Request Handle
   * getAllChildCategory()
   **/
  private getAllChildCategory() {
    const subscription = this.childCategoryService.getAllChildCategoryGroupByCategory().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }

  get isVisible() {
    if (this.currentUrl === '/offer') {
      return false;
    }  else if (this.currentUrl.includes('/landing-page/')) {
      return false;
    }else if (this.currentUrl.includes('/offer/')) {
      return false;
    }else {
      return true;
    }
  }

  /**
   * HTTP REQUEST CONTROLL
   * addNewsLetter()
   * getShopInfo()
   */

  private getShopInfo() {
    const subscription = this.shopInfoService.getShopInformation().subscribe({
      next: res => {
        this.shopInfo = res.data;
        this.isShow = true;
        this.setFavicon(this.shopInfo?.fabIcon)
        // console.log(this.shopInfo)
      },
      error: err => {
        console.error(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * x-icon
   * logo reload
   */
  setFavicon(iconPath: string) {
    if (isPlatformBrowser(this.platformId)) {
      const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
