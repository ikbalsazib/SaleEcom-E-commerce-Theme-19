import {Component, HostListener, inject, Input, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {UtilsService} from '../../../../../services/core/utils.service';
import {Subscription} from 'rxjs';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {UserService} from '../../../../../services/common/user.service';
import {UserDataService} from '../../../../../services/common/user-data.service';
import {User} from '../../../../../interfaces/common/user.interface';
import {Cart} from '../../../../../interfaces/common/cart.interface';
import {PricePipe} from "../../../../pipes/price.pipe";
import {Wishlist} from "../../../../../interfaces/common/wishlist.interface";
import {Search2Component} from './search-2/search-2.component';
import {HeaderCart2Component} from './header-cart-2/header-cart-2.component';
import {ReloadService} from "../../../../../services/core/reload.service";
import {ProductService} from "../../../../../services/common/product.service";
import {ImgCtrlPipe} from "../../../../pipes/img-ctrl.pipe";

@Component({
  selector: 'app-header-xl-2',
  templateUrl: './header-xl-2.component.html',
  styleUrls: ['./header-xl-2.component.scss'],
  imports: [
    RouterLink,
    CommonModule,
    Search2Component,
    HeaderCart2Component,
    ImgCtrlPipe,
    NgOptimizedImage
  ],
  providers: [PricePipe],
  standalone: true
})
export class HeaderXl2Component implements OnInit, OnDestroy {



  // Decorator
  @Input() carts: Cart[] = [];
  @Input() cartAnimate: boolean = false;
  @Input() wishlistAnimate: boolean = false;
  @Input() wishlists: Wishlist[];
  @Input() shopInfo: any;

  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';
  isVisible: boolean;
  user: User;
  isHydrated = false;
  compareListV2: string[] | any[] = [];


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
