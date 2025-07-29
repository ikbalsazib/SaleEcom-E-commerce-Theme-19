import {DOCUMENT, isPlatformBrowser, NgClass, NgFor, NgIf, ViewportScroller} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  inject,
  Input,
  OnChanges,
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
import {Subscription} from 'rxjs';
import {PricePipe} from '../../../shared/pipes/price.pipe';
import {ProductPricePipe} from '../../../shared/pipes/product-price.pipe';
import {TranslatePipe} from '../../../shared/pipes/translate.pipe';
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';
import {UtilsService} from '../../../services/core/utils.service';
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

@Component({
  selector: 'app-payment-area',
  templateUrl: './payment-area.component.html',
  styleUrl: './payment-area.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgFor, GalleryImageViewerComponent, ImageGalleryComponent, DeliveryCharge2Component, TranslatePipe, NgClass, MatRadioGroup, MatRadioButton, CurrencyCtrPipe, OtpInputComponent],
  providers: [PricePipe, ProductPricePipe],
})
export class PaymentAreaComponent implements OnInit, OnChanges {
  // Inputs
  @Input() singleLandingPage: any;

  // ViewChild Refs
  @ViewChild('payment') mainEl!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild('otpInput') otpInput!: ElementRef;

  dataForm: FormGroup;
  quantity = 1;
  animateGrandTotal = false;
  needRefreshForm: boolean = false;
  deliveryChargeAmount: number = 0;
  private readonly productPricePipe = inject(ProductPricePipe);
  selectedPaymentProvider = 'Cash on Delivery';
  note: any;
  public countdown = 60; // seconds
  private countdownInterval: any;
  productFixed = false;
  otpCode: string | null = null;
  shippingAddress: any;
  couponCode: string = null;
  couponDiscount: number = 0;
  deliveryCharge: any;
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
  isPageLoading: boolean = false;
  coupon: Coupon = null;
  divisions?: Division[] = [];
  selectedDivision: string | null = null;
  dropdownVisible = false;
  deliveryOptionType: any;
  isEnableOrderNote: boolean;
  isEnableOtp: boolean;
  advancePayment: any[] = [];

  // Gallery
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;
  showModal = false;
  isMobile: number;

  // Store Data
  selectedVariationList: any = null;
  selectedVariation: string = null;
  selectedVariation2: string = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

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


  constructor(private fb: FormBuilder, private orderService: OrderService, @Inject(DOCUMENT) private document: Document, private utilsService: UtilsService, private uiService: UiService, private router: Router,) {

    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      division: [null, Validators.required],
      phoneNo: [null, [Validators.required, this.mobileValidator]],
      shippingAddress: [null, Validators.required],
      code: [null, this.isSendOtp ? [Validators.required] : []]
    });

  }

  ngOnInit() {
    this.createCartFromLandingPage();
    this.getAllDivision();

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth;
    }
    this.getSetting();

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initiateCheckoutEvent();
      }, 100)
    }
  }

  ngOnChanges() {
    this.createCartFromLandingPage();
    this.product = this.singleLandingPage?.product;
    if (this.product?.isVariation) {
      this.setDefaultVariation();
    }
    this.setDefaultImage();
  }

  createCartFromLandingPage() {
    const product = this.singleLandingPage?.product;

    if (!product) return;

    const cartItem = {
      isSelected: true,
      product: product,
      quantity: this.quantity,
      selectedQty: this.quantity,
      variation: this.selectedVariationList
        ? {
          name: this.selectedVariationList.name,
          _id: this.selectedVariationList._id,
          image: this.selectedVariationList?.image,
          sku: this.selectedVariationList.sku
        }
        : null,
    };

    this.carts = [cartItem];

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

    const data: any = {
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
    }

    // OTP Check Logic
    if (!this.isEnableOtp) {
      this.addOrder(data);
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
        this.validateOtpWithPhoneNo(data);
      }
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
      filter: {status: 'publish'},
      select: mSelect,
      pagination: null,
      sort: {name: 1},
    };

    const subscription = this.divisionService.getAllDivisions(filter).subscribe({
      next: res => {
        this.divisions = res.data;
      },
      error: err => {
        console.log(err);
      }
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
          this.isLoading = false;
          this.isSendOtp = true;
          this.startCountdown(); // টাইমার চালু
          // this.uiService.message(res.message, 'success')
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


  /**
   * Utils
   * generateEventId()
   */
  private generateEventId() {
    this.eventId = this.utilsService.generateEventId();
  }

  private initiateCheckoutEvent(): void {
    // 1️⃣ Generate Unique Event ID
    this.generateEventId();

    // 2️⃣ Get hashed user data
    const user_data = this.utilsService.getUserData({
      email: this.userService.getUserLocalDataByField('email'),
      phoneNo: this.userService.getUserLocalDataByField('phoneNo'),
      external_id: this.userService.getUserLocalDataByField('userId'),
      lastName: this.userService.getUserLocalDataByField('name'),
      city: this.userService.getUserLocalDataByField('division'),
    });

    // 3️⃣ Prepare custom_data
    const custom_data = {
      content_ids: this.carts.map(m => m.product['_id']),
      value: this.grandTotal,
      num_items: this.carts.length,
      currency: 'BDT',
    };

    const eventTime = Math.floor(Date.now() / 1000);

    const original_event_data = {
      event_name: 'InitiateCheckout',
      event_time: eventTime,
    }

    // 4️⃣ Server-side payload for CAPI
    const trackData: any = {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.eventId,
      action_source: 'website',
      event_source_url: location.href,
      custom_data,
      original_event_data,
      ...(Object.keys(user_data).length > 0 && {user_data}),
    };

    // 5️⃣ Browser: Facebook Pixel (if not managed via GTM)
    if (!this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('InitiateCheckout', custom_data, this.eventId);

      // 7️⃣ Server: Send to Conversions API
      this.gtmService.trackInitiateCheckout(trackData).subscribe({
        next: () => {
        },
        error: () => {
        },
      });
    }

    // 6️⃣ Browser: GTM dataLayer push
    if (this.gtmService?.tagManagerId) {
      this.gtmService.pushToDataLayer({
        event: 'InitiateCheckout',
        event_id: this.eventId,
        page_url: window.location.href,
        ecommerce: {
          checkout: {
            actionField: {
              num_items: this.carts.length,
            },
            products: this.carts.map(m => ({
              id: m.product['_id'],
              name: m.product['name'],
              category: m.product['category']?.['name'],
              price: m.product['salePrice'],
              quantity: m.selectedQty,
            })),
            custom_data,
            original_event_data,
            ...(Object.keys(user_data).length > 0 && {user_data}),
          }
        }
      });
    }
  }


  private getSetting() {
    const subscription = this.settingService.getSetting('orderSetting advancePayment deliveryOptionType')
      .subscribe({
        next: res => {
          this.isEnableOrderNote = res.data?.orderSetting?.isEnableOrderNote;
          this.isEnableOtp = res.data?.orderSetting?.isEnableOtp;
          this.deliveryOptionType = res.data?.deliveryOptionType;
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
            this.dataForm.patchValue({shippingAddress: res.data?.shippingAddress})
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
    // this.deliveryChargeAmount = this.dataForm?.value.division? event.deliveryCharge : 0 ?? 0;
    // this.deliveryChargeAmount = this.dataForm?.value.division ? event.deliveryCharge ?? 0 : 0;
    this.updateDeliveryChargeAmount();
  }

  updateDeliveryChargeAmount() {
    this.deliveryChargeAmount =
      this.deliveryCharge?.freeDeliveryMinAmount && this.cartSaleSubTotal >= this.deliveryCharge.freeDeliveryMinAmount
        ? 0
        : this.dataForm?.value.division ? this.deliveryCharge?.deliveryCharge ?? 0 : 0;
  }

  getDeliveryLabel(): string {
    const selected = this.dataForm?.value.division;
    const city = this.deliveryCharge?.city;
    if (!selected || !city) return '';
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


}
