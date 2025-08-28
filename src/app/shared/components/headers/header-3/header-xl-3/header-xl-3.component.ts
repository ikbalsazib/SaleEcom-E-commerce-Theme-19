import {Component, HostListener, inject, Input, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Cart} from "../../../../../interfaces/common/cart.interface";
import {Wishlist} from "../../../../../interfaces/common/wishlist.interface";
import {User} from "../../../../../interfaces/common/user.interface";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {UtilsService} from "../../../../../services/core/utils.service";
import {UserService} from "../../../../../services/common/user.service";
import {UserDataService} from "../../../../../services/common/user-data.service";
import {ReloadService} from "../../../../../services/core/reload.service";
import {ProductService} from "../../../../../services/common/product.service";
import {Subscription} from "rxjs";
import {isPlatformBrowser, NgIf, NgOptimizedImage} from "@angular/common";
import {ImgCtrlPipe} from "../../../../pipes/img-ctrl.pipe";
import {HeaderCart3Component} from "./header-cart-3/header-cart-3.component";
import {Search3Component} from "./search-3/search-3.component";
import {Category} from "../../../../../interfaces/common/category.interface";
import {CategoryService} from "../../../../../services/common/category.service";

@Component({
  selector: 'app-header-xl-3',
  templateUrl: './header-xl-3.component.html',
  styleUrl: './header-xl-3.component.scss',
  imports: [
    ImgCtrlPipe,
    RouterLink,
    NgOptimizedImage,
    HeaderCart3Component,
    Search3Component,
    NgIf
  ],
  standalone: true
})
export class HeaderXl3Component implements OnInit, OnDestroy {
  // Decorator
  @Input() carts: Cart[] = [];
  @Input() cartAnimate: boolean = false;
  @Input() isShow: boolean = false;
  @Input() wishlistAnimate: boolean = false;
  @Input() wishlists: Wishlist[];
  @Input() shopInfo: any;

  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';
  isVisible: boolean;
  user: User;
  isHydrated = false;
  compareListV2: string[] | any[] = [];
  categories: Category[] = [];
  filteredHomeCategoryMenu: any[] = [];
  isLoading: boolean = true;

  // Scroll
  isHeaderFixed: boolean = false;
  isHeaderTopHidden: boolean = false;


  // Inject
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  protected readonly userService = inject(UserService);
  private readonly userDataService = inject(UserDataService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly reloadService = inject(ReloadService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);


  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const subscription1 = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.utilsService.removeUrlQuery(event.urlAfterRedirects);
        this.isVisible = this.utilsService.routeBaseVisibility(currentUrl);
      }
    });
    this.subscriptions?.push(subscription1);

    const subscription2 = this.reloadService.refreshCompareList$.subscribe(() => {
      this.getCompareList();
    });
    this.subscriptions?.push(subscription2);

    if (this.userService.isUser) {
      this.getLoggedInUserData();
    }

    // Base data
    this.checkHydrated();
    this.getCompareList();
    this.getAllCategory();
  }


  private getAllCategory() {
    const subscription = this.categoryService.getAllCategory().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.filteredHomeCategoryMenu = this.categories
          .filter(cat => cat.showHomeMenu === true)
          .map(cat => ({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            images: cat.images
          }));
        // console.log("filtered filteredHomeCategoryMenu--", this.filteredHomeCategoryMenu);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }


  @HostListener('window:scroll')
  onScroll() {
    this.isHeaderTopHidden = window.scrollY > 250;
  }


  /**
   * Hydrated Manage
   * checkHydrated()
   */

  protected checkHydrated() {
    if (isPlatformBrowser(this.platformId)) {
      this.isHydrated = true;
    }
  }

  /**
   * HTTP REQ
   * getLoggedInUserData()
   */

  getCompareList() {
    this.compareListV2 = this.productService.getCompareList();
  }

  private getLoggedInUserData() {
    const subscription = this.userDataService.getLoggedInUserData('name username').subscribe({
      next: res => {
        this.user = res.data;
      },
      error: err => {
        console.log(err)
      }
    });
    this.subscriptions?.push(subscription);
  }



  navigateToHome(): void {
    // Check if already on the home page
    if (this.router.url === '/') {
      // Reload the home page
      window.location.reload();
    } else {
      // Navigate to the home page
      this.router.navigate(['/']).then();
    }
  }

  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
