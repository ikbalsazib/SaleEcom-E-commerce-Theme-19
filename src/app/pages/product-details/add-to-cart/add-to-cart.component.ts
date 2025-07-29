import {Component, inject, Inject, Input, OnDestroy, OnInit} from "@angular/core";
import {PricePipe} from "../../../shared/pipes/price.pipe";
import {Product, VariationList} from "../../../interfaces/common/product.interface";
import {Subscription} from "rxjs";
import {UiService} from "../../../services/core/ui.service";
import {ReloadService} from "../../../services/core/reload.service";
import {Router} from "@angular/router";
import {UserService} from "../../../services/common/user.service";
import {CartService} from "../../../services/common/cart.service";
import {Cart} from "../../../interfaces/common/cart.interface";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {ProductPricePipe} from "../../../shared/pipes/product-price.pipe";
import {ImageLoadErrorDirective} from "../../../shared/directives/image-load-error.directive";
import {MatIcon} from "@angular/material/icon";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";


@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss'],
  standalone: true,
  providers: [PricePipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ProductPricePipe,
    ImageLoadErrorDirective,
    MatIcon,
    CurrencyCtrPipe,
    TranslatePipe,
  ]
})
export class AddToCartComponent implements OnInit, OnDestroy {

  // Decorator
  @Input() cart: any = null;

  // Store Data
  product: Product;
  selectedQty: number = 1;
  selectedVariationList: VariationList = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;
  image: any;
  zoomImage: any;
  prevImage: any;

  //Loader
  cartLoader: boolean = false;
  buyNowLoader: boolean = false;
  isModalVisible = false;

  // Inject
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddToCartComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
  ) {}

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    this.product = this.data.product;
    this.setDefaultImage();
    // Set Default Variation
    if (this.product.isVariation) {
      this.setDefaultVariation();
    }
  }


  /**
   * Bottom Sheet dismiss
   */
  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }


  /**
   * onIncrementQtySimple
   * onDecrementQtySimple
   */

  onIncrementQtySimple(event?: MouseEvent, url?: string) {
    if (event) {
      event.stopPropagation();
    }
    // if (this.selectedQty === 6) {
    //   this.uiService.message('Maximum quantity are 6', "warn");
    //   return;
    // }
    this.selectedQty += 1;
  }

  onDecrementQtySimple(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedQty === 1) {
      this.uiService.message('Minimum quantity is 1', "warn");
      return;
    }
    this.selectedQty -= 1;
  }

  /**
   MODAL HANDLE METHOD
   * setDefaultImage()
   * onSelectVariation2
   */

  private setDefaultImage() {
    this.image =
      this.product?.images && this.product?.images.length > 0
        ? this.product?.images[0]
        : 'https://cdn.saleecom.com/upload/images/placeholder.png';
    this.zoomImage = this.image;
  }

  getVariationImage(name: string): string | undefined {
    return this.product?.variationList.find(
      (v) => v?.name.toLowerCase().includes(name.toLowerCase())
    )?.image;
  }
  /**
   * Variation Functions
   * onSelectVariation()
   * onAddToCart()
   * addToCartDB
   */

  private setDefaultVariation() {
    if (this.product?.variation) {
      this.selectedVariation = this.product?.variationOptions[0];
    }
    if (this.product?.variation2) {
      this.selectedVariation2 = this.product?.variation2Options[0];
    }
    // Selected Variation List
    this.setSelectedVariationList();

  }

  private setSelectedVariationList() {
    if (this.selectedVariation && this.selectedVariation2) {
      this.selectedVariationList = this.product?.variationList.find(
        f => f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    } else {
      this.selectedVariationList = this.product?.variationList.find(f => f.name === `${this.selectedVariation}`)
    }
  }

  onSelectVariation(name: string) {
    if (this.selectedVariation !== name) {
      this.selectedVariation = name;
      if(this.convertToLowercase(this.product?.variation) === "color" || this.convertToLowercase(this.product?.variation) === "colour"){
        this.prevImage = this.image;
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
        }
      // this.prevImage = this.image;
      // let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1).image;
      // this.image = image && image.length > 0 ? image : this.prevImage;
      this.setSelectedVariationList();
    }
  }

  onSelectVariation2(name: string) {
    if (this.selectedVariation2 !== name) {
      this.selectedVariation2 = name;
      if(this.convertToLowercase(this.product?.variation2) === "color" || this.convertToLowercase(this.product?.variation2) === "colour"){
        let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
        this.image = image && image.length > 0 ? image : this.prevImage;
      }
      // let image = this.product?.variationList.find((v) => v?.name.toLowerCase().indexOf(name.toLowerCase()) > -1 && v?.name.toLowerCase().indexOf(this.selectedVariation.toLowerCase()) > -1).image;
      // this.image = image && image.length > 0 ? image : this.prevImage;
      this.setSelectedVariationList();
    }
  }

  convertToLowercase(inputString: string): string {
    return inputString?.toLowerCase()?.trim();
  }

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const getVariationOption = () => {
      if (this.product?.variation && this.product.variation2) {
        return `${this.product?.variation}, ${this.product.variation2}`
      } else {
        return `${this.product?.variation}`
      }
    }
    const data: Cart = {
      product: this.product?._id,
      selectedQty: this.selectedQty,
      isSelected: true,
      variation: this.selectedVariationList ? {
        _id: this.selectedVariationList?._id,
        name: this.selectedVariationList?.name,
        image: this.selectedVariationList?.image,
        option: getVariationOption(),
        sku: this.selectedVariationList?.sku,
      } : null
    };
    if (this.userService.isUser) {
      if (this.product?.isVariation) {
        if (this.selectedVariationList) {
          this.addToCartDB(data, 'addToCart');
        } else {
          this.uiService.message('Select Variant.', "warn");
        }
      } else {
        this.addToCartDB(data, 'addToCart');
      }
    } else {
      this.cartService.addCartItemToLocalStorage(data);
      this.reloadService.needRefreshCart$(true);
      // this.uiService.message('Add to cart Successfully', 'success');
      this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
      this.bottomSheetRef.dismiss();
    }
  }

  addToCartDB(data: Cart, type: 'addToCart' | 'buyNow') {
    const subscription = this.cartService.addToCart(data).subscribe({
      next: res => {
        if (type === 'addToCart') {
          setTimeout(() => {
            this.cartLoader = false;
          }, 350);
          this.uiService.actionMessage('Success! Product added to your cart.', "success", '/cart', '/checkout', 'local_mall', 'View Cart', 'Buy Now');
          this.isModalVisible = false;
          this.bottomSheetRef.dismiss();
        }
        this.reloadService.needRefreshCart$(true);
        if (type === 'buyNow') {
          setTimeout(() => {
            this.buyNowLoader = false;
          }, 350);
          this.router.navigate(['/checkout'], {
            queryParams: {cart: res?.data?._id},
            queryParamsHandling: 'merge'
          }).then();
          this.bottomSheetRef.dismiss();
        }
      },
      error: (error) => {
        this.cartLoader = false;
        this.buyNowLoader = false;
        console.log(error);
      },
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
