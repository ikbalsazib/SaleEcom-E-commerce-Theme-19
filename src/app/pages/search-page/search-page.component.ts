import {AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Product} from "../../interfaces/common/product.interface";
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Subject,
  Subscription,
  switchMap,
  takeUntil
} from "rxjs";
import {ProductService} from "../../services/common/product.service";
import {Pagination} from "../../interfaces/core/pagination";
import {FilterData} from "../../interfaces/core/filter-data";
import {Location, NgOptimizedImage, TitleCasePipe} from '@angular/common';
import {ShopInformation} from "../../interfaces/common/shop-information.interface";
import {ShopInformationService} from "../../services/common/shop-information.service";
import {ReloadService} from "../../services/core/reload.service";
import {CartService} from "../../services/common/cart.service";
import {UserService} from "../../services/common/user.service";
import {Cart} from "../../interfaces/common/cart.interface";
import {ProductPricePipe} from "../../shared/pipes/product-price.pipe";
import {AutoInputFocusDirective} from "../../shared/directives/auto-input-focus.directive";
import {EmptyDataComponent} from "../../shared/components/ui/empty-data/empty-data.component";
import {ImgCtrlPipe} from "../../shared/pipes/img-ctrl.pipe";
import {CurrencyCtrPipe} from '../../shared/pipes/currency.pipe';
@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ProductPricePipe,
    AutoInputFocusDirective,
    EmptyDataComponent,
    ImgCtrlPipe,
    NgOptimizedImage,
    TitleCasePipe,
    RouterLink,
    CurrencyCtrPipe
  ]
})
export class SearchPageComponent implements AfterViewInit, OnDestroy,OnInit {

  // Decorator
  @ViewChild('searchForm') searchForm: NgForm;
  @ViewChild('searchInput') searchInput: ElementRef;

  // Store Data
  searchProducts: Product[] = [];
  carts: Cart[] = [];
  searchQuery = null;
  shopInfo: ShopInformation;
  cartAnimate: boolean = false
  protected readonly rawSrcset: string = '384w, 640w';
  isHeaderTopHidden: boolean = false;

  // Loading
  isLoading = false;

  // Inject
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly reloadService = inject(ReloadService);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly shopInfoService= inject(ShopInformationService);

  // Subscriptions
  private destroy$ = new Subject<void>();
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
    this.getShopInfo();
  }


  ngAfterViewInit(): void {
    const subscription = this.searchForm?.valueChanges
      .pipe(
        map((t: any) => t['searchTerm']),
        filter(() => this.searchForm.valid),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((data) => {
          this.searchQuery = data?.trim();
          if (this.searchQuery === '' || !this.searchQuery) {
            this.searchProducts = [];
            this.searchQuery = null;
            return EMPTY;
          }
          this.isLoading = true;
          const pagination: Pagination = {
            pageSize: 12,
            currentPage: 0,
          };
          // Select
          const mSelect = {
            name: 1,
            slug: 1,
            images: 1,
            category: 1,
            variationList: 1,
            regularPrice: 1,
            salePrice: 1,
            isVariation: 1,
            minimumWholesaleQuantity: 1,
            wholesalePrice: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: {status: 'publish'},
            select: mSelect,
            sort: {createdAt: -1},
          };
          return this.productService.getAllProducts(
            filterData,
            this.searchQuery
          );

        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.searchProducts = res.data.sort((a, b) => a.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) - b.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()));
        },
        error: err => {
          this.isLoading = false;
          console.log(err);
        }
      });

    this.subscriptions?.push(subscription);
  }


  goBack(): void {
    this.location.back();
  }

  /**
   * Search Methods
   * onSelectItem()
   * onSearchNavigate()
   * onClearSearch()
   */
  onSelectItem(data: Product): void {
    this.searchInput.nativeElement.value = '';
    this.router.navigate(['/', 'product-details', data?.slug]).then();
  }

  onSearchNavigate() {
    let inputVal = (this.searchInput.nativeElement as HTMLInputElement).value;
    if (inputVal) {
      this.router.navigate(['/', 'products'], {
        queryParams: {searchQuery: inputVal},
        queryParamsHandling: ''
      }).then();
      this.searchInput.nativeElement.value = "";
    }
  }

  onClearSearch() {
    this.searchForm.reset();
  }

  /**
   * HTTP REQUEST CONTROLL
   * getShopInfo()
   * getCartsItems()
   */

  private getShopInfo() {
    const subscription = this.shopInfoService.getShopInformation() .subscribe({
      next: res => {
        this.shopInfo = res.data;
      },
      error: err => {
        console.error(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

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
        'name slug salePrice regularPrice images quantity category isVariation variationList minimumWholesaleQuantity wholesaleUnit wholesalePrice isWholesale';
      const subscription = this.productService.getProductByIds(ids, select)
        .subscribe({
          next: res => {
            const products = res.data;
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


  /**
   * HostListener
   */
  @HostListener('window:scroll')
  onScroll() {
    this.isHeaderTopHidden = window.scrollY > 250;
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
