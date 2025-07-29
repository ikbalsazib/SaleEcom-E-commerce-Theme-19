import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import {PricePipe} from "../../../pipes/price.pipe";
import {VariationList} from "../../../../interfaces/common/product.interface";
import {Subscription} from "rxjs";
import {UiService} from "../../../../services/core/ui.service";
import {ReloadService} from "../../../../services/core/reload.service";
import {Router} from "@angular/router";
import {UserService} from "../../../../services/common/user.service";
import {CartService} from "../../../../services/common/cart.service";
import {Cart} from "../../../../interfaces/common/cart.interface";
import {NgClass, } from "@angular/common";
import {PriceRangePipe} from "../../../pipes/price-range.pipe";
import {FormsModule} from "@angular/forms";
import {WishlistService} from "../../../../services/common/wishlist.service";
import {CurrencyCtrPipe} from '../../../pipes/currency.pipe';


@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss'],
  standalone: true,
  imports: [
    PricePipe,
    NgClass,
    PriceRangePipe,
    FormsModule,
    CurrencyCtrPipe,
  ],
  providers: [PricePipe],
})
export class AddToCartComponent  implements OnInit,OnChanges {
  @Input() isVisible: boolean = false;
  @Input() product: any;
  @Input() data: any;
  @Input() cart:  any = null;
  @Output() closePopup = new EventEmitter();
  indexNumber = 0;

  // @ViewChild('galleryPop', { static: false }) galleryPop!: GalleryComponent;
  selectedQty: number = 1;

  // Store Data
  selectedVariationList: VariationList = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;
  image: any;
  zoomImage: any;
  prevImage:any;

  private subDataAddCart: Subscription;
  private subDataUpdateCart: Subscription;
  private subDataOne: Subscription;

  private readonly wishlistService = inject(WishlistService);
  constructor(
    // private modal: ModalController,
    private uiService: UiService,
    private reloadService: ReloadService,
    // private bottomSheetRef: MatBottomSheetRef<AddToCartComponent>,
    // @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private router: Router,
    private userService: UserService,
    private cartService: CartService,
  ) { }

  ngOnInit() {
    // this.product = this.data.product;
    // setTimeout(() => {
    //   this.product = this.data.product;
    //   this.setDefaultImage();
    //   console.log(' this.product55566777878', this.product)
    // }, 400);


    this.setDefaultImage();
  }

  ngOnChanges(changes: SimpleChanges) {

  }
  close() {
    this.closePopup.emit(false);
  }
  dismiss(): void {
    // this.bottomSheetRef.dismiss();
  }
  onIncrementQtySimple(event?: MouseEvent, url?: string) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedQty === 6) {
      this.uiService.message('Maximum quantity are 6',"warn");
      return;
    }
    this.selectedQty += 1;
  }

  onDecrementQtySimple(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedQty === 1) {
      this.uiService.message('Minimum quantity is 1',"warn");
      return;
    }
    this.selectedQty -= 1;
  }

  /**
   MODAL HANDLE METHOD
   * onCloseModal()
   */
  onCloseModal() {
    // this.modal.dismiss();
  }

  private setDefaultImage() {
    this.image =
      this.product?.images && this.product?.images.length > 0
        ? this.product?.images[0]
        : 'https://cdn.saleecom.com/upload/images/placeholder.png';
    this.zoomImage = this.image;
  }

  onSelectVariation2(name: string) {
    if (this.selectedVariation2 === name) {
      this.selectedVariation2 = null;
      this.selectedVariationList = null;
    } else {
      this.selectedVariation2 = name;
      let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
      this.image = image && image.length > 0 ? image : this.prevImage;
      if (this.selectedVariation) {
        this.selectedVariationList = this.product?.variationList.find(
          (f) =>
            f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
        );
      }
    }
  }

  /**
   * Variation Functions
   * onSelectVariation()
   * onSelectVariation2()
   */
  onSelectVariation(name: string) {
    if (this.selectedVariation === name) {
      this.selectedVariation = null;
      this.selectedVariationList = null;
      this.image = this.prevImage;
    } else {
      this.selectedVariation = name;
      this.prevImage = this.image;
      let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
      this.image = image && image.length > 0 ? image : this.prevImage;

      if (this.selectedVariation2) {
        this.selectedVariationList = this.product?.variationList.find(
          (f) =>
            f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
        );
      } else {
        if (!this.product?.variation2) {
          this.selectedVariationList = this.product?.variationList.find(
            (f) => f.name === `${this.selectedVariation}`
          );
        }
      }
    }

    // this.checkCartList();
  }

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();
    // if (this.cart) {
    //   // this.router.navigate(['/cart']).then();
    //   this.uiService.warn('Product already added in your cart');
    //   return;
    // }

    const data: Cart | any= {
      product: this.product?._id,
      selectedQty: this.selectedQty,
      unitValue: 1,
      // priceId: this.selectedPriceData._id,
      // unit: this.selectedPriceData.name,

      // selected er ekta function nite hobe and variation dynamic korte hobe . na bujhle amy knock diyen
      variation: {
        _id: this.selectedVariationList?._id,
        name: this.selectedVariationList?.name,
        sku: this.selectedVariationList?.sku,
      },
      select: true,
    };
    if (this.userService.getUserStatus()) {
      if (this.product?.isVariation) {
        if (this.selectedVariationList) {
          this.addToCartDB(data, 'addToCart');
        } else {
          this.uiService.message('Select Variant.',"warn");
        }
      } else {
        this.addToCartDB(data, 'addToCart');
      }
    } else {
      if (this.product?.isVariation) {
        if (this.selectedVariationList) {
          // this.cartService.addCartItemLocalStorage(data);
          this.reloadService.needRefreshCart$(true);
        } else {
          this.uiService.message('Select Variant.',"wrong");
        }
      } else {
        // this.cartService.addCartItemLocalStorage(data);
        this.reloadService.needRefreshCart$(true);
      }
    }
  }
  // checkCartList() {
  //   if (this.product?.isVariation) {
  //     if (this.selectedVariationList) {
  //       this.cart = this.carts.find(
  //         (f) =>
  //           (f.product as Product)._id === this.product?._id &&
  //           this.selectedVariationList?._id === f?.variation['_id']
  //       );
  //     } else {
  //       this.cart = null;
  //     }
  //   } else {
  //     this.cart = this.carts.find(
  //       (f) => (f.product as Product)._id === this.product?._id
  //     );
  //   }
  // }


  onBuyNow(event: MouseEvent) {
    event.stopPropagation();
    const data: Cart | any = {
      product: this.product?._id,
      selectedQty: this.selectedQty,
      unitValue: 1,
      // priceId: this.selectedPriceData._id,
      // unit: this.selectedPriceData.name,

      // selected er ekta function nite hobe and variation dynamic korte hobe . na bujhle amy knock diyen
      variation: {
        _id: this.selectedVariationList?._id,
        name: this.selectedVariationList?.name,
        sku: this.selectedVariationList?.sku,
      },
      select: false,
    };
    if (this.userService.getUserStatus()) {
      if (this.product?.isVariation) {
        if (this.selectedVariationList) {
          this.addToCartDB(data, 'buyNow');
        } else {
          this.uiService.message('Select Variant.',"wrong");
        }
      } else {
        this.addToCartDB(data, 'buyNow');
      }
    } else {
      if (this.product?.isVariation) {
        if (this.selectedVariationList) {
          // this.cartService.addCartItemLocalStorage(data);
          // this.reloadService.needRefreshCart$(true);
          // this.router.navigate(['/', 'checkout']);
          this.router.navigate(['/login'], {queryParams: {navigateFrom: this.router.url}, queryParamsHandling: 'merge'})
        } else {
          this.uiService.message('Select Variant.',"wrong");
        }
      } else {
        // this.cartService.addCartItemLocalStorage(data);
        this.reloadService.needRefreshCart$(true);
        // this.router.navigate(['/', 'checkout']);
        this.router.navigate(['/login'], {queryParams: {navigateFrom:this.router.url}, queryParamsHandling: 'merge'})
      }
    }
    // if (this.carts.length > 0) {
    //   this.router.navigate(['/', 'checkout']);
    // } else {
    //   this.uiService.warn('Sorry, No products in your cart');
    // }
  }

  addToCartDB(data: Cart, type: 'addToCart' | 'buyNow') {
    this.subDataAddCart = this.cartService.addToCart(data).subscribe({
      next: (res) => {
        if (type === 'addToCart') {
          this.uiService.message(res.message,"success");
          this.removeWishlistById(this?.data);
        }
        this.reloadService.needRefreshCart$(true);
        this.isVisible = false;
        if (type === 'buyNow') {
          // this.modal.dismiss();
          this.router
            .navigate(['/checkout'], {
              queryParams: { cart: res?.data?._id },
              queryParamsHandling: 'merge',
            })
            .then();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // remove Wishlist By Id
  public removeWishlistById(wishlistId: any) {
    // console.log('wertwet',wishlistId)
    this.subDataOne = this.wishlistService.deleteWishlistById(wishlistId)
      .subscribe(res => {

        // this.reloadService.needRefreshWishlist$(true);
        this.wishlistService.needRefreshStoredWishlist$();
        this.reloadService.needRefreshWishList$();
        this.uiService.message(res.message, 'success');
      }, error => {
        console.log(error);
      });
  }

  /**
   * Outside click popoup close
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event:Event) {
    console.log("this is outside event handling")
    const popUpContent = document.querySelector('.modal-area') as HTMLElement;
    if(this.isVisible && popUpContent && !popUpContent.contains(event.target as Node)){
      this.close();
    }
  }



  /**
   * SHOW GALLERY
   */
  onShowPop(index: any) {
    // if (index > -1) {
    //   this.galleryPop.onShowGallery(index);
    //   this.reloadService.needRefreshHidden$(true);
    //   this.router.navigate([],{queryParams: {isOpenImage: true}})
    // }
  }
}
