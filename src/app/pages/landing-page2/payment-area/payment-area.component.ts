import {DOCUMENT, isPlatformBrowser, NgClass, NgIf, ViewportScroller} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription, debounceTime} from 'rxjs';
import {PricePipe} from '../../../shared/pipes/price.pipe';
import {ProductPricePipe} from '../../../shared/pipes/product-price.pipe';
import {TranslatePipe} from '../../../shared/pipes/translate.pipe';
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';
import {UtilsService} from '../../../services/core/utils.service';
import {TiktokPixelService} from "../../../services/core/tiktok-pixel.service";
import {UiService} from '../../../services/core/ui.service';
import {OrderService} from '../../../services/common/order.service';
import {ReloadService} from '../../../services/core/reload.service';
import {GtmService} from '../../../services/core/gtm.service';
import {DivisionService} from '../../../services/common/division.service';
import {SettingService} from '../../../services/common/setting.service';
import {OtpService} from '../../../services/common/otp.service';
import {Coupon} from '../../../interfaces/common/coupon.interface';
import {UserAddress} from '../../../interfaces/common/user.interface';
import {DeliveryCharge} from '../../../interfaces/common/setting.interface';
import {Division} from '../../../interfaces/common/division.interface';
import {FilterData} from '../../../interfaces/core/filter-data';
import {
  GalleryImageViewerComponent
} from '../../../shared/components/gallery-image-viewer/gallery-image-viewer.component';
import {ImageGalleryComponent} from '../image-gallery/image-gallery.component';
import {DeliveryCharge2Component} from '../../checkouts/checkout-2/delivery-charge-2/delivery-charge-2.component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatDialog} from "@angular/material/dialog";
import {OtpInputComponent} from "../../../shared/components/otp-input/otp-input.component";
import {UserService} from '../../../services/common/user.service';
import {CouponService} from "../../../services/common/coupon.service";
import {DiscountTypeEnum} from "../../../enum/product.enum";
import {AppConfigService} from "../../../services/core/app-config.service";
import {PaymentMethodComponent} from "../../checkouts/components/payment-method/payment-method.component";

@Component({
  selector: 'app-payment-area',
  templateUrl: './payment-area.component.html',
  styleUrl: './payment-area.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, GalleryImageViewerComponent, ImageGalleryComponent, DeliveryCharge2Component, TranslatePipe, NgClass, MatRadioGroup, MatRadioButton, CurrencyCtrPipe, OtpInputComponent, PaymentMethodComponent],
  providers: [PricePipe, ProductPricePipe],
})
export class PaymentAreaComponent implements OnInit, OnChanges, OnDestroy {
  // Inputs
  @Input() singleLandingPage: any;
  @Input() chatLink: any;

  // ViewChild Refs
  @ViewChild('payment') mainEl!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild('otpInput') otpInput!: ElementRef;
  allowedShopIds1 = ['692d89a8597c97480fcceb9f','690c2389d71f4cf10fe34fe4'];
  dataForm: FormGroup;
  quantity = 1;
  animateGrandTotal = false;
  needRefreshForm: boolean = false;

  hasZeroDeliveryCharge: boolean = false;

  deliveryChargeAmount: number = 0;
  private readonly productPricePipe = inject(ProductPricePipe);
  selectedPaymentProvider = 'Cash on Delivery';
  selectedPaymentProviderType: string;
  allPaymentProvider: any;
  note: any;
  public countdown = 60; // seconds
  private countdownInterval: any;
  productFixed = false;
  otpCode: string | null = null;
  shippingAddress: any;
  couponCode: string = null;
  couponDiscount: number = 0;
  deliveryCharge: any;
  isIncompleteOrderId: boolean = false;
  userLandingDiscount: any;
  currency = 'BDT';
  isLoaded: boolean = false;
  orderData: any;
  product: any;
  carts: any[] = [];
  private eventId: string;
  image: any;
  prevImage: any;
  isLoadingPhoneNo: boolean = false;
  // Loading
  isLoading: boolean = false;
  isInvalidOtp: boolean = false;
  isValidOtp: boolean = false;
  isSendOtp: boolean = false;
  isCoupon: boolean = false;
  incompleteOrderId: any;
  incompleteOrderData: any;
  isPageLoading: boolean = false;
  coupon: Coupon = null;
  divisions?: Division[] = [];
  selectedDivision: string | null = null;
  dropdownVisible = false;
  country: any;
  deliveryOptionType: any;
  productSetting: any;
  isEnableOrderNote: boolean;
  isEnableOtp: boolean;
  advancePayment: any[] = [];
  allShopID = ['688712bcdcdd7416499b7808'];
  // Gallery
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  showModal = false;
  isMobile: number;
  shopId: any;

  // Store Data
  selectedVariationList: any = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;

  // Product selection data - will be populated from singleLandingPage
  availableProducts: any[] = [];

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private hasInitiatedCheckout = false;

  // Inject
  private readonly reloadService = inject(ReloadService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly gtmService = inject(GtmService);
  private readonly divisionService = inject(DivisionService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly settingService = inject(SettingService);
  private readonly otpService = inject(OtpService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly couponService = inject(CouponService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly tiktokPixelService = inject(TiktokPixelService);

  constructor(private fb: FormBuilder, private orderService: OrderService, @Inject(DOCUMENT) private document: Document, private utilsService: UtilsService, private uiService: UiService, private router: Router,) {

    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      division: ['outside-dhaka', Validators.required],
      phoneNo: [null, [Validators.required, this.mobileValidator]],
      shippingAddress: [null, Validators.required],
      code: [null, this.isSendOtp ? [Validators.required] : []]
    });

  }

  ngOnInit() {
    this.getSetting();
    this.initializeProducts();
    this.createCartFromLandingPage();


    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth;
    }


    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (!this.isAllowedShop) {
          this.initiateCheckoutEvent();
        }
      }, 100)
    }

    this.subscriptions.push(
      this.dataForm.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
        if (this.isIncompleteOrderId && this.incompleteOrderId) {
          this.updateIncompleteOrderById();
        }
      })
    );
  }

  isAllowedShop(): boolean {
    const shopId = this.appConfigService.getSettingData('shop');
    return !!shopId && this.allShopID.includes(shopId);
  }

  ngOnChanges() {
    this.initializeProducts();
    this.createCartFromLandingPage();
    this.product = this.singleLandingPage?.product;
    if (this.product?.isVariation) {
      this.setDefaultVariation();
    }
    this.setDefaultImage();
  }

  createCartFromLandingPage() {
    // Create cart from selected products using original product data
    this.carts = this.availableProducts
      .filter(product => product.isSelected)
      .map(product => {
        let variation = null;

        // Handle variation products
        if (product.originalProduct.isVariation && product.selectedSize !== 'Default') {
          // Find the correct variation from the product's variationList
          const selectedVariation = product.originalProduct.variationList?.find(
            (v: any) => v.name === product.selectedSize
          );

          if (selectedVariation) {
            variation = {
              name: product.selectedSize,
              _id: selectedVariation._id,
              image: selectedVariation.image || product.image,
              sku: selectedVariation.sku || product.id + '_' + product.selectedSize,
              salePrice: selectedVariation.salePrice,
              regularPrice: selectedVariation.regularPrice,
              wholesalePrice: selectedVariation.wholesalePrice,
              deliveryCharge: selectedVariation.deliveryCharge,
              advancePayment: selectedVariation.advancePayment,
            };
          }
        }

        return {
          isSelected: true,
          product: product.originalProduct, // Use the original product data
          quantity: product.quantity,
          selectedQty: product.quantity,
          variation: variation
        };
      });

    // Update incomplete order if it exists
    if (this.isIncompleteOrderId && this.incompleteOrderId) {
      this.updateIncompleteOrderById();
    }
    
    this.validateCoupon();
  }


  onChangePaymentMethod(event: any) {
    this.selectedPaymentProvider = event;
  }

  onChangePaymentType(event: any) {
    this.selectedPaymentProviderType = event;
  }

  allPaymentMethod(event: any) {
    this.allPaymentProvider = event;
  }

  private addOrder(data: any) {
    this.isLoading = true;
    const subscription = this.orderService.addOrder(data, false).subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoading = false;
          switch (res.data.providerName) {
            case 'Cash on Delivery': {
              this.uiService.message(res.message, 'success');
               this.router.navigate(['/success-order'], {
                queryParams: {orderId: res.data.orderId, orderForm: 'landing-page'},
              }).then();
              break;
            }
            case 'Bkash': {
              if (res.success && res.data.link) {
                this.document.location.href = res.data.link;
              } else {
                this.uiService.message(res.message, 'wrong');
              }
              break;
            }
            case 'SSl Commerz': {
              if (res.success && res.data.link) {
                this.document.location.href = res.data.link;
              } else {
                this.uiService.message(res.message, 'wrong');
              }
              break;
            }
          }
        } else {
          this.uiService.message(res.message, 'warn');
        }

      },
      error: (error) => {
        console.log(error);
      },
    });
    this.subscriptions?.push(subscription);
  }


  /**
   * UI Methods
   * onConfirmOrder()
   */
  public onConfirmOrder() {
    const selectedProducts = this.getSelectedProducts();
    if (!selectedProducts.length) {
      this.uiService.message('কোনো প্রোডাক্ট সিলেক্ট করা হয়নি। দয়া করে প্রোডাক্ট সিলেক্ট করুন।', "warn");
      return;
    }

    if (!this.carts.length) {
      this.uiService.message('Empty Cart! sorry your cart is empty.', "warn");
      this.router.navigate(['/']).then();
      return;
    }
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
    }

    if (!this.dataForm.value?.name) {
      this.needRefreshForm = true;
      this.uiService.message('Please enter your name', "warn");
      this.scrollToField(this.nameInput);
      return;
    }

    if (!this.dataForm.value?.phoneNo) {
      this.needRefreshForm = true;
      this.uiService.message('Please enter your phone no', "warn");
      this.scrollToField(this.phoneInput);
      return;
    }

    if (!this.dataForm.value?.shippingAddress) {
      this.needRefreshForm = true;
      this.uiService.message('Please enter your shipping address', "warn");
      this.scrollToField(this.addressInput);
      return;
    }

    if (!this.dataForm.value?.division) {
      this.needRefreshForm = true;
      this.uiService.message('Please select your division', "warn");
      this.reloadService.needRefreshSticky$(true);
      return;
    }

    // const getCartOrProductIds = () => {
    //   return this.carts.map(m => m.product['_id']);
    // }
    // // this.openOtpDialog()
    //
    // const cartData = () => {
    //   return this.carts.map(m => {
    //     return {
    //       ...m,
    //       ...{
    //         product: m.product['_id']
    //       }
    //     }
    //   })
    //
    // }
    //
    // const data: any = {
    //   user: null,
    //   orderType: 'anonymous',
    //   carts: getCartOrProductIds(),
    //   cartData: cartData(),
    //   name: this.dataForm.value?.name,
    //   phoneNo: this.dataForm.value?.phoneNo,
    //   shippingAddress: this.dataForm.value?.shippingAddress,
    //   division: this.dataForm.value?.division,
    //   area: this.shippingAddress?.area ?? 'Unknown',
    //   zone: this.shippingAddress?.zone ?? 'Unknown',
    //   addressType: this.shippingAddress?.addressType,
    //   email: null,
    //   orderFrom: 'Landing Page',
    //   providerName: this.selectedPaymentProvider,
    //   note: this.note,
    //   deliveryType: this.deliveryCharge?.type,
    //   coupon: this.coupon ? this.coupon?._id : null,
    //   userLanding: this.userLandingDiscount?.landingType,
    //   needSaveAddress: true,
    // }

    // OTP Check Logic
    if (!this.isEnableOtp) {
      this.addOrder(this.orderFinalData);
    } else {
      if (!this.isSendOtp) {
        if (this.dataForm.invalid) {
          this.scrollToField(this.phoneInput);
          this.uiService.message('সঠিক তথ্য দিন', 'warn');
          return;
        }
        this.generateOtpWithPhoneNo();
      } else {
        if (!this.otpCode) {
          // this.scrollToField(this.otpInput);
          this.uiService.message('ওটিপি কোড লিখুন', 'warn');
          return;
        }
        this.validateOtpWithPhoneNo(this.orderFinalData);
      }
    }

  }


  private get orderFinalData() {
    const getCartOrProductIds = () => {
      return this.carts.map(m => m.product['_id']);
    }
    // this.openOtpDialog()

    const cartData = () => {
      return this.carts.map(m => {
        return {
          ...m,
          ...{
            product: m.product['_id']
          }
        }
      })

    }

    return {
      ...{
        user: null,
        orderType: 'anonymous',
        carts: getCartOrProductIds(),
        cartData: cartData(),
        name: this.dataForm.value?.name,
        phoneNo: this.dataForm.value?.phoneNo,
        shippingAddress: this.dataForm.value?.shippingAddress,
        division: this.dataForm.value?.division,
        area: this.shippingAddress?.area ?? 'Unknown',
        zone: this.shippingAddress?.zone ?? 'Unknown',
        addressType: this.shippingAddress?.addressType,
        email: null,
        orderFrom: 'Landing Page',
        providerName: this.selectedPaymentProvider,
        note: this.note,
        deliveryType: this.deliveryCharge?.type,
        coupon: this.coupon ? this.coupon?._id : null,
        userLanding: this.userLandingDiscount?.landingType,
        needSaveAddress: true,
        providerType: this.selectedPaymentProviderType,
        incompleteOrderId: this.incompleteOrderId ?? null,
      },
    }
  }

  /**
   * Variation Functions
   * onSelectVariation()
   * onSelectVariation2()
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

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  selectDivision(item: any) {
    this.selectedDivision = item.name;
    this.dataForm.patchValue({division: item?.name});
    if (this.dataForm?.value) {
      this.dataForm.patchValue({division: item?.name});
    }

    this.dropdownVisible = false;
  }

  private setSelectedVariationList() {
    if (this.selectedVariation && this.selectedVariation2) {
      this.selectedVariationList = this.product?.variationList.find(
        f => f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    } else {
      this.selectedVariationList = this.product?.variationList.find(f => f.name === `${this.selectedVariation}`)
    }
    this.createCartFromLandingPage();
  }

  // Method to check if the variation is out of stock
  isOutOfStock(variation1: string, variation2: string | null): boolean {
    if (variation1) {
      const variationName = variation2
        ? `${variation1}, ${variation2}`
        : variation1;
      const variation: any = this.singleLandingPage?.product?.variationList.find(
        (v) => v.name === variationName
      );
      return variation ? variation.quantity === 0 : false;
    }
    return false;
  }

  private setDefaultImage() {
    this.image =
      this.singleLandingPage?.product?.images && this.singleLandingPage?.product?.images?.length > 0
        ? this.singleLandingPage?.product?.images[0]
        : '/assets/images/placeholder/test.png';
  }

  onSelectVariation(name: string) {
    this.selectedVariation = name;
    this.prevImage = this.image;
    const variation = this.singleLandingPage?.product?.variationList.find((v) =>
      v?.name.toLowerCase().includes(name.toLowerCase())
    );
    this.image = variation?.image && variation.image.length > 0 ? variation.image : this.prevImage;
    if (this.selectedVariation2) {
      this.selectedVariationList = this.singleLandingPage?.product?.variationList.find(
        (f) =>
          f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    } else {
      this.selectedVariationList = !this.singleLandingPage?.product?.variation2
        ? this.singleLandingPage?.product?.variationList.find(
          (f) => f.name === `${this.selectedVariation}`
        )
        : null;
    }
    // }
    this.createCartFromLandingPage();
  }

  onSelectVariation2(name: string) {
    // Select new second variation
    this.selectedVariation2 = name;

    // Find the image for the selected variation combination
    const variation = this.singleLandingPage?.product?.variationList.find(
      (v) =>
        v?.name.toLowerCase().includes(name.toLowerCase()) &&
        v?.name.toLowerCase().includes(this.selectedVariation.toLowerCase())
    );
    this.image = variation?.image && variation.image.length > 0 ? variation.image : this.prevImage;

    // If first variation is selected, find combined variation
    if (this.selectedVariation) {
      this.selectedVariationList = this.singleLandingPage?.product?.variationList.find(
        (f) =>
          f.name === `${this.selectedVariation}, ${this.selectedVariation2}`
      );
    }
    // }
    this.createCartFromLandingPage();
  }


  /**
   * HTTP REQUEST HANDLE
   * getAllDivision()
   * checkUserWithPhoneNo()
   * validateOtpWithPhoneNo()
   */
  private getAllDivision() {
    let mSelect = {
      name: 1,
    };
    const filter: FilterData = {
      filter: {country: this.country?.name, status: 'publish'},
      select: mSelect,
      pagination: null,
      sort: { name: 1 },
    };

    const subscription = this.divisionService
      .getAllDivisions(filter)
      .subscribe({
        next: (res) => {
          this.divisions = res.data;
        },
        error: (err) => {
          console.log(err);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private generateOtpWithPhoneNo() {
    this.isLoading = true;
    const subscription = this.otpService.generateOtpWithPhoneNo({
      phoneNo: this.dataForm.value.phoneNo
    })
      .subscribe({
        next: res => {
          if (res.success) {

            this.isLoading = false;
            this.isSendOtp = true;
            this.startCountdown(); // টাইমার চালু
            // this.uiService.message(res.message, 'success')
          } else {
            this.isLoading = false;
            this.uiService.message(res.message, 'wrong')
          }
        },
        error: err => {
          console.log(err);
          this.isLoading = false;
        }
      });
    this.subscriptions?.push(subscription);
  }

  private validateOtpWithPhoneNo(data: any) {
    this.isLoading = true;
    const subscription = this.otpService.validateOtpWithPhoneNo({
      phoneNo: this.dataForm.value.phoneNo,
      code: this.otpCode,
    })
      .subscribe({
        next: res => {
          this.isLoading = false;
          if (res.success) {
            this.uiService.message(res.message, 'success');
            this.addOrder(data);
            this.isValidOtp = true;
          } else {
            this.uiService.message(res.message, 'warn');
            this.isInvalidOtp = true;
          }
        },
        error: err => {
          console.log(err);
          this.isLoading = false;
        }
      });
    this.subscriptions?.push(subscription);
  }


  onResendOtp(): void {
    this.generateOtpWithPhoneNo(); // আবার ওটিপি পাঠানো
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdown = 60;
    clearInterval(this.countdownInterval); // আগের টাইমার বন্ধ

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  increaseQuantity(btn?: HTMLElement) {
    this.quantity++;
    this.createCartFromLandingPage();
    this.triggerGrandTotalAnimation();
    this.updateDeliveryChargeAmount();
  }

  decreaseQuantity(btn?: HTMLElement) {
    if (this.quantity > 1) {
      this.quantity--;
      this.createCartFromLandingPage();
      this.triggerGrandTotalAnimation();
    }
    this.updateDeliveryChargeAmount();
  }


  mobileValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';

    // Remove space and check for 11 or 13 digit BD number
    const trimmed = value.trim();
    const regex = /^(?:\+88)?01[3-9]\d{8}$/;

    if (!regex.test(trimmed)) {
      return {invalidMobile: true};
    }

    return null;
  }


  get cartDiscountAmount(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'discountAmount',
        item.variation?._id,
        item.selectedQty,
        item?.isWholesale
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get cartSaleSubTotal(): number {
    return this.carts.map(item => {
      return this.productPricePipe.transform(
        item.product,
        'salePrice',
        item.variation?._id,
        item.selectedQty
      ) as number;
    }).reduce((acc, value) => acc + value, 0);
  }

  get grandTotal(): number {
    return this.cartSaleSubTotal + (this.deliveryChargeAmount ?? 0) - (this.userLandingDiscount?.amount ?? 0) - (this.couponDiscount ?? 0);
  }




  get cartDeliveryChargeTotal(): number {
    // ---- Detect inside city using division ----
    const currentDivision = (this.dataForm?.value?.division ?? '').toString().trim().toLowerCase();
    const deliveryCity = (this.deliveryCharge?.city ?? '').toString().trim().toLowerCase();
    const isInsideCity = currentDivision && deliveryCity && currentDivision === deliveryCity;

    this.hasZeroDeliveryCharge = false;

    // ---- Global delivery charge ----
    const globalCharge = Number(this.deliveryCharge?.deliveryCharge) || 0;

    // console.log('carts',this.carts)
    // ---- Calculate per-product delivery charge ----
    const productCharges = (this.carts ?? []).map((item: any) => {
      const pd = item?.product?.deliveryCharge;
      const enabled = pd?.isEnableDeliveryCharge === true;

      if (enabled) {
        const rawCharge = isInsideCity ? pd?.insideCity : pd?.outsideCity;
        const charge = Number(rawCharge);

        if (Number.isFinite(charge)) {
          if (charge === 0) this.hasZeroDeliveryCharge = true;
          return charge;
        }
      }

      // fallback → will use global charge later
      return null;
    });

    // ---- Sum all valid product charges ----
    const perProductTotal = productCharges
      .filter((x) => x !== null)
      .reduce((acc, val) => acc + val, 0);

    const needsGlobal = productCharges.some((x) => x === null);

    const total = perProductTotal + (needsGlobal ? globalCharge : 0);

    if (needsGlobal && globalCharge === 0) {
      this.hasZeroDeliveryCharge = true;
    }

    return total;
  }



  /**
   * Utils
   * generateEventId()
   */
  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private initiateCheckoutEvent(): void {
    if (this.hasInitiatedCheckout || !this.carts?.length) return;
    this.hasInitiatedCheckout = true;

    // 1️⃣ Generate Unique Event ID
    this.generateEventId();

    // 2️⃣ Get hashed user data
    const user_data = this.utilsService.getUserData({
      email: this.dataForm.value.email || this.userService.getUserLocalDataByField('email'),
      phoneNo: this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      firstName: this.dataForm.value.name || this.userService.getUserLocalDataByField('name'),
      city: this.dataForm.value.division || this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare contents
    const contents = this.carts.map((c: any) => ({
      id: String(c.product['_id']),
      quantity: Number(c.selectedQty ?? 1),
      item_price: Number(this.productPricePipe.transform(c.product, 'salePrice', c.variation?._id, 1, c.isWholesale)) || 0,
    }));

    // 4️⃣ Prepare custom_data
    const custom_data = {
      content_ids: contents.map(c => c.id),
      contents,
      content_type: 'product',
      value: Number(this.grandTotal ?? 0),
      currency: 'BDT',
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
      content_name: this.carts.map(c => c.product['name']).join(', '),
      content_category: this.carts.map(c => c.product['category']?.['name']).filter(c => c).join(', '),
      shipping: Number(this.deliveryChargeAmount || 0),
      ...this.utilsService.getFbCookies()
    };

    const eventTime = Math.floor(Date.now() / 1000);
    const original_event_data = {
      event_name: 'InitiateCheckout',
      event_time: eventTime,
    };

    // 5️⃣ Server-side payload for CAPI
    const trackData: any = {
      event_name: 'InitiateCheckout',
      event_time: eventTime,
      creationTime: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && { user_data }),
    };

    // 6️⃣ Send to Meta APIs
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('InitiateCheckout', custom_data, this.eventId);
    }
    this.gtmService.trackInitiateCheckout(trackData).subscribe();

    // 7️⃣ TikTok Tracking
    const analytics = this.appConfigService.getSettingData('analytics');
    if (analytics?.tiktokPixelId) {
      const userEmail = this.dataForm.value.email || this.userService.getUserLocalDataByField('email');
      const userPhone = this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo');

      const tiktokBrowserData: any = {
        value: this.grandTotal,
        currency: 'BDT',
        contents: contents.map(c => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        content_name: custom_data.content_name,
        content_category: custom_data.content_category,
      };

      if (userEmail) tiktokBrowserData.email = userEmail;
      if (userPhone) tiktokBrowserData.phone_number = userPhone;

      this.tiktokPixelService.track('InitiateCheckout', tiktokBrowserData, this.eventId);

      this.tiktokPixelService.trackServerEvent({
        event: 'InitiateCheckout',
        eventId: this.eventId,
        value: this.grandTotal,
        currency: 'BDT',
        contents: tiktokBrowserData.contents,
        email: userEmail,
        phoneNo: userPhone,
        externalId: this.userService.getUserLocalDataByField('userId'),
        ttclid: this.tiktokPixelService.getTtclid(),
        ttp: this.tiktokPixelService.getTtp(),
        customProperties: {
          content_name: custom_data.content_name,
          content_category: custom_data.content_category,
        }
      });
    }

    // 8️⃣ GTM Data Layer Push (GA4)
    if (this.gtmService.tagManagerId) {
      const name = this.dataForm.value.name || this.userService.getUserLocalDataByField('name') || '';
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      this.gtmService.pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BDT',
          value: this.grandTotal,
          items: contents.map((c, i) => ({
            item_id: c.id,
            item_name: this.carts[i].product['name'],
            item_category: this.carts[i].product['category']?.['name'],
            price: c.item_price,
            quantity: c.quantity,
          }))
        },
        user_data: [{
          em: this.utilsService.hashDataSha256(this.dataForm.value.email || this.userService.getUserLocalDataByField('email')?.trim()?.toLowerCase() || ''),
          ph: this.utilsService.hashDataSha256(this.utilsService.normalizeBdPhone(this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo')) || ''),
          fn: this.utilsService.hashDataSha256(this.utilsService.normText(firstName) || ''),
          ln: this.utilsService.hashDataSha256(this.utilsService.normText(lastName) || ''),
          ct: (this.dataForm.value.division || this.userService.getUserLocalDataByField('division')) ? this.utilsService.hashDataSha256(this.utilsService.normText(this.dataForm.value.division || this.userService.getUserLocalDataByField('division')) || '') : '',
          country: this.utilsService.hashDataSha256('Bangladesh'),
          country_code: this.utilsService.hashDataSha256('BD')
        }]
      });
    }
  }

  private completePaymentEvent(orderId: string): void {
    // 1️⃣ Use orderId as eventId for deduplication
    this.eventId = orderId;

    // 2️⃣ Get hashed user data
    const cleanData = (data: any, titleCase: boolean = false) => {
      let d = String(data || '').trim();
      if (!d || d.toLowerCase() === 'n/a' || d.toLowerCase() === 'outside-dhaka') return '';
      if (titleCase) { d = this.utilsService.toTitleCase(d); }
      return d;
    };

    const formatExternalIdName = (name: string) => {
      const d = String(name || '').trim().toLowerCase();
      if (!d || d === 'n/a') return '';
      return d.charAt(0).toUpperCase() + d.slice(1);
    };

    const rawId = (
      formatExternalIdName(this.dataForm.value.name || this.userService.getUserLocalDataByField('name')) +
      cleanData(this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo')) +
      cleanData(this.dataForm.value.email || this.userService.getUserLocalDataByField('email')) +
      cleanData(this.dataForm.value.shippingAddress || this.userService.getUserLocalDataByField('address')) +
      cleanData(this.dataForm.value.division || this.userService.getUserLocalDataByField('division'))
    ).replace(/\s+/g, '');

    const externalIdRaw = rawId.charAt(0).toUpperCase() + rawId.slice(1).toLowerCase();

    const user_data = this.utilsService.getUserData({
      email: this.dataForm.value.email || this.userService.getUserLocalDataByField('email'),
      phoneNo: this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo'),
      external_id: externalIdRaw,
      firstName: this.dataForm.value.name || this.userService.getUserLocalDataByField('name'),
      city: this.dataForm.value.division || this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare contents
    const contents = this.carts.map((c: any) => ({
      id: String(c.product['_id']),
      quantity: Number(c.selectedQty ?? 1),
      item_price: Number(this.productPricePipe.transform(c.product, 'salePrice', c.variation?._id, 1, c.isWholesale)) || 0,
    }));

    // 4️⃣ Prepare custom_data
    const custom_data = {
      content_ids: contents.map(c => c.id),
      contents,
      content_type: 'product',
      value: Number(this.grandTotal ?? 0),
      currency: 'BDT',
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
      content_name: this.carts.map(c => c.product['name']).join(', '),
      content_category: this.carts.map(c => c.product['category']?.['name']).filter(c => c).join(', '),
      shipping: Number(this.deliveryChargeAmount || 0),
      ...this.utilsService.getFbCookies()
    };

    const eventTime = Math.floor(Date.now() / 1000);
    const original_event_data = {
      event_name: 'Purchase',
      event_time: eventTime,
    };

    // 5️⃣ Server-side payload for CAPI
    const trackData: any = {
      event_name: 'Purchase',
      event_time: eventTime,
      creationTime: eventTime,
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && { user_data }),
    };

    // 6️⃣ Send to Meta APIs
    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('Purchase', custom_data, this.eventId);
    }
    this.gtmService.trackPurchase(trackData).subscribe();

    // 7️⃣ TikTok Tracking
    const analytics = this.appConfigService.getSettingData('analytics');
    if (analytics?.tiktokPixelId) {
      const userEmail = this.dataForm.value.email || this.userService.getUserLocalDataByField('email');
      const userPhone = this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo');

      const tiktokBrowserData: any = {
        value: this.grandTotal,
        currency: 'BDT',
        contents: contents.map(c => ({
          content_id: c.id,
          content_type: 'product',
          quantity: c.quantity,
          price: c.item_price,
        })),
        content_name: custom_data.content_name,
        content_category: custom_data.content_category,
      };

      if (userEmail) tiktokBrowserData.email = userEmail;
      if (userPhone) tiktokBrowserData.phone_number = userPhone;

      this.tiktokPixelService.track('CompletePayment', tiktokBrowserData, this.eventId);

      this.tiktokPixelService.trackServerEvent({
        event: 'CompletePayment',
        eventId: this.eventId,
        value: this.grandTotal,
        currency: 'BDT',
        contents: tiktokBrowserData.contents,
        email: userEmail,
        phoneNo: userPhone,
        externalId: externalIdRaw,
        ttclid: this.tiktokPixelService.getTtclid(),
        ttp: this.tiktokPixelService.getTtp(),
        customProperties: {
          order_id: orderId,
          content_name: custom_data.content_name,
          content_category: custom_data.content_category,
        }
      });
    }

    // 8️⃣ GTM Data Layer Push (GA4)
    if (this.gtmService.tagManagerId) {
      const name = this.dataForm.value.name || this.userService.getUserLocalDataByField('name') || '';
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      this.gtmService.pushToDataLayer({
        event: 'purchase',
        order_id: orderId,
        event_id: this.eventId,
        external_id: externalIdRaw,
        ecommerce: {
          transaction_id: orderId,
          affiliation: "Website",
          value: this.grandTotal,
          tax: 0,
          shipping: Number(this.deliveryChargeAmount || 0),
          currency: 'BDT',
          items: contents.map((c, i) => ({
            item_id: c.id,
            item_name: this.carts[i].product['name'],
            item_category: this.carts[i].product['category']?.['name'],
            price: c.item_price,
            quantity: c.quantity,
          }))
        },
        customer_information: {
          first_name: firstName,
          last_name: lastName,
          phone: this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo'),
          address_1: this.dataForm.value.shippingAddress || this.userService.getUserLocalDataByField('address'),
          city: (this.dataForm.value.division || this.userService.getUserLocalDataByField('division')),
          country: "Bangladesh",
          country_code: "BD"
        },
        user_data: [{
          external_id: this.utilsService.hashDataSha256(externalIdRaw),
          em: this.utilsService.hashDataSha256(this.dataForm.value.email || this.userService.getUserLocalDataByField('email')?.trim()?.toLowerCase() || ''),
          ph: this.utilsService.hashDataSha256(this.utilsService.normalizeBdPhone(this.dataForm.value.phoneNo || this.userService.getUserLocalDataByField('phoneNo')) || ''),
          fn: this.utilsService.hashDataSha256(this.utilsService.normText(firstName) || ''),
          ln: this.utilsService.hashDataSha256(this.utilsService.normText(lastName) || ''),
          ct: (this.dataForm.value.division || this.userService.getUserLocalDataByField('division')) ? this.utilsService.hashDataSha256(this.utilsService.normText(this.dataForm.value.division || this.userService.getUserLocalDataByField('division')) || '') : '',
          country: this.utilsService.hashDataSha256('Bangladesh'),
          country_code: this.utilsService.hashDataSha256('BD')
        }]
      });
    }
  }


  private getSetting() {
    const subscription = this.settingService.getSetting('orderSetting incompleteOrder advancePayment deliveryOptionType productSetting country')
      .subscribe({
        next: res => {
          this.isEnableOrderNote = res.data?.orderSetting?.isEnableOrderNote;
          this.isEnableOtp = res.data?.orderSetting?.isEnableOtp;
          this.deliveryOptionType = res.data?.deliveryOptionType;
          this.productSetting = res.data?.productSetting;
          this.country = res.data?.country;
          this.getAllDivision();

          this.incompleteOrderData = res.data?.incompleteOrder;
          setTimeout(() => {
            if (
              this.deliveryOptionType?.isEnableInsideCityOutsideCity &&
              this.deliveryCharge?.city
            ) {
              this.dataForm.patchValue({division: this.deliveryCharge.city});
            }
          }, 100);

          if (res.data?.advancePayment && res.data?.advancePayment.length) {
            this.advancePayment = res.data.advancePayment.filter(f => f.status === 'active');
          }

          if (this.productSetting) {

            this.deliveryChargeAmount = this.cartDeliveryChargeTotal ? this.cartDeliveryChargeTotal : 0;
          }

        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }

  // User data get by phone number
  onPhoneNumberInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (input.length === 11) {
      this.isLoadingPhoneNo = true;
      this.handlePhoneNumberFilled({phoneNo: input});

      // Check if incomplete order should be created
      if (this.incompleteOrderData && this.incompleteOrderData.isEnableIncompleteOrder) {
        this.createIncompleteOrderIfNeeded();
      }
    }
  }

  handlePhoneNumberFilled(data: any): void {
    // Call your function and stop the spinner after completion
    setTimeout(() => {
      this.getUserDataByPhoneNo(data)
    }, 1000); // Simulating API call or function processing delay
  }

  getUserDataByPhoneNo(data: any) {
    const subscription = this.orderService.getUserDataByPhoneNo(data)
      .subscribe({
        next: async res => {
          this.isLoadingPhoneNo = false;
          if (res.success) {
            this.dataForm.patchValue( res.data)
          } else {
            this.uiService.message(res.message, 'warn');
          }
        },
        error: err => {
          this.uiService.message(err?.error?.message[0], 'wrong');
          this.isLoadingPhoneNo = false;
          console.log(err)
        }
      })
    this.subscriptions.push(subscription);
  }

  onChangeAddress(event: UserAddress) {
    this.shippingAddress = event;
    // this.division = this.shippingAddress.division;
  }

  onChangeDeliveryCharge(event: DeliveryCharge) {
    this.deliveryCharge = event;
    // console.log(this.deliveryCharge)
    // this.deliveryChargeAmount = this.dataForm?.value.division? event.deliveryCharge : 0 ?? 0;
    // this.deliveryChargeAmount = this.dataForm?.value.division ? event.deliveryCharge ?? 0 : 0;
    this.updateDeliveryChargeAmount();
  }

  // updateDeliveryChargeAmount() {
  //   this.deliveryChargeAmount =
  //     this.deliveryCharge?.freeDeliveryMinAmount && this.cartSaleSubTotal >= this.deliveryCharge.freeDeliveryMinAmount
  //       ? 0
  //       : this.dataForm?.value.division ? this.deliveryCharge?.deliveryCharge ?? 0 : 0;
  // }


  // updateDeliveryChargeAmount() {
  //
  //   const isFreeDelivery = this.deliveryCharge?.freeDeliveryMinAmount &&
  //     this.cartSaleSubTotal >= this.deliveryCharge.freeDeliveryMinAmount;
  //
  //   if (this.productSetting?.isEnableDeliveryCharge && this.cartDeliveryChargeTotal > 0) {
  //     this.deliveryChargeAmount = isFreeDelivery
  //       ? this.cartDeliveryChargeTotal :
  //       this.hasZeroDeliveryCharge ? this.cartDeliveryChargeTotal + (this.deliveryCharge?.deliveryCharge ?? 0) : this.cartDeliveryChargeTotal;
  //   } else {
  //     this.deliveryChargeAmount = isFreeDelivery
  //       ? 0
  //       : (this.deliveryCharge?.deliveryCharge ?? 0);
  //   }
  //
  //
  //   console.log("  this.deliveryChargeAmount",  this.deliveryChargeAmount)
  // }

  updateDeliveryChargeAmount() {

    const isFreeDelivery = this.deliveryCharge?.freeDeliveryMinAmount &&
      this.cartSaleSubTotal >= this.deliveryCharge.freeDeliveryMinAmount;

    // if (this.cartDeliveryChargeTotal) {
    //   this.deliveryChargeAmount = isFreeDelivery
    //     ? this.cartDeliveryChargeTotal :
    //     this.hasZeroDeliveryCharge ? this.cartDeliveryChargeTotal + (this.deliveryCharge?.deliveryCharge ?? 0) : this.cartDeliveryChargeTotal;
    // } else {
    //   this.deliveryChargeAmount = isFreeDelivery
    //     ? 0
    //     : (this.deliveryCharge?.deliveryCharge ?? 0);
    // }
    this.deliveryChargeAmount = isFreeDelivery
      ? 0
      : (this.cartDeliveryChargeTotal ?? 0);

    // console.log("  this.deliveryChargeAmount", this.deliveryChargeAmount)
  }


  getDeliveryLabel(): string {
    const selected = this.dataForm?.value.division;
    const city = this.deliveryCharge?.city;
    if (!selected || !city) return '';
    // if (!city) return '';
    return selected === city ? `Inside ${city} :` : `Outside ${city} :`;
  }

  /**
   * Gallery View
   * openGallery()
   * closeGallery()
   */
  openGallery(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.isGalleryOpen = true;
  }

  openGalleryMobile(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.showModal = true;
  }


  closeGallery(): void {
    this.isGalleryOpen = false;
  }

  closeModal1() {
    this.showModal = false;
  }

  @HostListener('window:scroll')
  scrollBody() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the footer's Y offset position
      const [_, footerTop] = this.viewportScroller.getScrollPosition();
      const windowHeight = window.innerHeight;
      const footerOffsetTop = document.getElementById('payment1')?.offsetTop || 0;

      if (window.scrollY > 200 && window.scrollY + windowHeight >= footerOffsetTop) {
        this.productFixed = true;
      } else {
        this.productFixed = false;
      }
    }
  }

  private scrollToField(field: ElementRef) {
    if (field) {
      field.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
      field.nativeElement.focus();
    }
  }

  triggerGrandTotalAnimation() {
    this.animateGrandTotal = false;
    setTimeout(() => {
      this.animateGrandTotal = true;
      setTimeout(() => this.animateGrandTotal = false, 400);
    });
  }

  onOtpEnter(value: string): void {
    this.otpCode = value;
    // this.validateOtpWithPhoneNo('');
  }

  closePopup() {
    this.isSendOtp = false;
  }


  /**
   * COUPON HANDLE
   * checkCouponAvailability()
   * calculateCouponDiscount()
   * onRemoveCoupon()
   */

  public checkCouponAvailability() {
    if (!this.couponCode?.trim()) {
      this.uiService.message('Please enter your vouchers code.', "warn");
      return;
    }

    const subscription = this.couponService
      .checkCouponAvailability({
        couponCode: this.couponCode,
        subTotal: this.cartSaleSubTotal,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.uiService.message(res.message, 'success');
            this.coupon = res.data;
            if (this.coupon) {
              this.calculateCouponDiscount();
            }
          } else {
            this.uiService.message(res.message, "warn");
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  private validateCoupon() {
    if (this.couponCode && this.coupon) {
      this.couponService.checkCouponAvailability({
        couponCode: this.couponCode,
        subTotal: this.cartSaleSubTotal,
      }).subscribe({
        next: (res) => {
          if (!res.success) {
            this.onRemoveCoupon();
            this.uiService.message('Coupon removed because it is no longer valid for the updated cart amount.', 'warn');
          } else {
            this.coupon = res.data;
            this.calculateCouponDiscount();
          }
        },
        error: () => {
          this.onRemoveCoupon();
        }
      });
    }
  }

  private calculateCouponDiscount() {
    if (this.coupon.discountType === DiscountTypeEnum.PERCENTAGE) {
      this.couponDiscount = Math.floor(
        (this.coupon.discountAmount / 100) * this.cartSaleSubTotal
      );
    } else {
      this.couponDiscount = Math.floor(this.coupon.discountAmount);
    }
  }


  onRemoveCoupon() {
    this.couponDiscount = 0
    this.couponCode = null;
    this.coupon = null;

  }

  onSelectCouponOpen() {
    this.isCoupon = true;
  }

  onSelectCouponClose() {
    this.isCoupon = false;
  }

  /**
   * Product Selection Methods
   */
  onProductSelect(productId: string, isSelected: boolean) {
    const product = this.availableProducts.find(p => p.id === productId);
    if (product) {
      product.isSelected = isSelected;
      this.createCartFromLandingPage();
      this.updateDeliveryChargeAmount();
    }
  }

  onSizeSelect(productId: string, size: string) {
    const product = this.availableProducts.find(p => p.id === productId);
    if (product) {
      product.selectedSize = size;

      // Change product image and price if variation has specific data
      if (product.originalProduct.isVariation && product.originalProduct.variationList) {
        const selectedVariation = product.originalProduct.variationList.find(
          (v: any) => v.name === size
        );
        if (selectedVariation) {
          // Update image if available
          if (selectedVariation.image && selectedVariation.image.length > 0) {
            product.image = selectedVariation.image;
          }

          // Update price based on selected variation
          product.currentPrice = selectedVariation.salePrice;
          product.oldPrice = selectedVariation.regularPrice;
        }
      }

      this.createCartFromLandingPage();
    }
  }

  onQuantityChange(productId: string, change: number) {
    const product = this.availableProducts.find(p => p.id === productId);
    if (product) {
      const newQuantity = product.quantity + change;
      if (newQuantity >= 1) {
        product.quantity = newQuantity;
        this.createCartFromLandingPage();
        this.updateDeliveryChargeAmount();
      }
    }
  }

  getSelectedProducts() {
    return this.availableProducts.filter(product => product.isSelected);
  }

  initializeProducts() {
    if (this.singleLandingPage?.product && Array.isArray(this.singleLandingPage.product)) {
      this.availableProducts = this.singleLandingPage.product.map((product: any, index: number) => {
        // Handle different variation structures
        let availableSizes = ['Default'];
        let selectedSize = 'Default';
        let currentPrice = product.salePrice;
        let oldPrice = product.regularPrice;

        if (product.isVariation) {
          if (product.variationOptions && product.variationOptions.length > 0) {
            availableSizes = product.variationOptions;
            selectedSize = product.variationOptions[0];
          } else if (product.variation2Options && product.variation2Options.length > 0) {
            availableSizes = product.variation2Options;
            selectedSize = product.variation2Options[0];
          }

          // Set initial price based on first variation
          if (product.variationList && product.variationList.length > 0) {
            const firstVariation = product.variationList.find((v: any) => v.name === selectedSize);
            if (firstVariation) {
              currentPrice = firstVariation.salePrice;
              oldPrice = firstVariation.regularPrice;
            }
          }
        }

        return {
          id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder/test.png',
          currentPrice: currentPrice,
          oldPrice: oldPrice,
          selectedSize: selectedSize,
          availableSizes: availableSizes,
          quantity: 1,
          isSelected: this.isAllowedShop1() ? false : index === 0, // For isAllowedShop1 shops, no product selected by default
          originalProduct: product // Keep reference to original product data
        };
      });
      // console.log('Products initialized from API:', this.availableProducts);
    } else {
      // console.log('No products found in singleLandingPage');
    }
  }
  getSocialLink(type: string): any {
    switch (type) {
      case 'messenger':
        return this.chatLink?.find(f => f.chatType === 'messenger') ?? null;
      case 'whatsapp':
        return this.chatLink?.find(f => f.chatType === 'whatsapp') ?? null;
      case 'phone':
        return this.chatLink?.find(f => f.chatType === 'phone') ?? null;
      default:
        return null;
    }
  }


  private incompleteOrder() {

    const subscription = this.orderService?.addIncompleteOrder(this.orderFinalData, this.userService?.isUser).subscribe({
      next: (res) => {

        this.incompleteOrderId = res?.data?._id
        this.isIncompleteOrderId = true
        // console.log('success',res);
      },
      error: (error) => {
        console.log(error);
      },
    });
    if (subscription) {
      this.subscriptions?.push(subscription);
    }

  }

  private createIncompleteOrderIfNeeded() {
    // Only create incomplete order if we don't already have one
    if (!this.isIncompleteOrderId && this.carts.length > 0) {
      this.incompleteOrder();
    }
  }


  updateIncompleteOrderById() {

    const subscription = this.orderService?.updateIncompleteOrderById(this.incompleteOrderId, this.orderFinalData).subscribe({
      next: (res) => {
        if (res.success) {
          // console.log("update Incomplete Order");
        }
      },
      error: (err) => {
        console.error('Error fetching order:', err);
      }
    });
    if (subscription) {
      this.subscriptions?.push(subscription);
    }
  }

  isAllowedShop1(): boolean {
    const id = this.appConfigService.getSettingData('shop');
    return !!id && this.allowedShopIds1.includes(id);
  }

  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }


}
