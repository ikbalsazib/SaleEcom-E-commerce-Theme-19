import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {SettingService} from '../../../../services/common/setting.service';
import {Subscription} from 'rxjs';
import {PAYMENT_METHODS} from '../../../../core/utils/app-data';
import {TitleComponent} from '../../../../shared/components/title/title.component';
import {PaymentCardLoaderComponent} from '../../../../shared/loader/payment-card-loader/payment-card-loader.component';
import {isPlatformBrowser, JsonPipe} from '@angular/common';
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {SafeHtmlCustomPipe} from '../../../../shared/pipes/safe-html.pipe';
import {UiService} from "../../../../services/core/ui.service";

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.scss',
  imports: [
    TitleComponent,
    PaymentCardLoaderComponent,
    TranslatePipe,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslatePipe,
    SafeHtmlCustomPipe
  ],
  standalone: true
})
export class PaymentMethodComponent implements OnInit, OnChanges, OnDestroy {

  // Decorator
  @Input() userOfferDiscount: any;
  @Input() country: any;
  @Output() onChangePaymentMethod = new EventEmitter<unknown>();
  @Output() onChangePaymentType = new EventEmitter<unknown>();
  @Output() allPaymentMethod = new EventEmitter<unknown>();
  @Input() orderLanguage: string = 'en';


  // Store Data
  paymentMethodSetting: any;
  paymentMethods: any[] = [];
  filterPaymentMethods: any[] = [];
  isCashOnDeliveryOff: boolean = false;
  isLoading: boolean = true;
  dataForm: FormGroup;

  selectedPaymentMethodLogo: string;


  // Payment Data
  titleData = 'Select a Payment Option';
  selectedPaymentProvider: string;
  selectedPaymentProviderType: string;
  selectedPayment: any;
  allPaymentMethods: any[] = PAYMENT_METHODS;
  isCopied : boolean = false;

  // Inject
  private readonly settingService = inject(SettingService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private uiService = inject(UiService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base Data
    this.getPaymentMethod();

    this.dataForm = this.fb.group({
      customerPaymentNo: [null],
      transactionAmount: [null],
      paymentTransactionId: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.getFilterPaymentMethods();
      }, 100)
    }
  }


  /**
   * HTTP Req Handle
   * getPaymentMethod()
   */

  private getPaymentMethod() {
    const subscription = this.settingService.getPaymentMethod()
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.paymentMethodSetting = res.data;
          this.paymentMethods = res.data?.paymentMethods;
          this.isCashOnDeliveryOff = res.data?.isCashOnDeliveryOff;
          this.getFilterPaymentMethods();
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * UI LOGIC
   * getFilterPaymentMethods()
   * onSelectPaymentMethod()
   */
  getFilterPaymentMethods() {
    const paymentProviders = new Set(this.paymentMethods.map(m => m.providerName));

    const matchedPaymentMethods = this.allPaymentMethods.filter(f =>
      paymentProviders.has(f.providerName)
    );

    // Manage with User Offer
    if (this.userOfferDiscount?.offerType === 'online-payment') {
      this.isCashOnDeliveryOff = true;
    } else {
      this.isCashOnDeliveryOff = this.paymentMethodSetting?.isCashOnDeliveryOff;
    }
    if (!this.isCashOnDeliveryOff) {
      const cashOnDeliveryOption = this.allPaymentMethods.find(
        f => f.providerName === 'Cash on Delivery'
      );
      if (cashOnDeliveryOption) {
        matchedPaymentMethods.unshift(cashOnDeliveryOption);
      }
    }

    // this.filterPaymentMethods = matchedPaymentMethods;
    // console.log("this.filterPaymentMethods----> log", this.filterPaymentMethods);

    if (!this.country || this.country?.name === 'Bangladesh') {
      this.filterPaymentMethods = matchedPaymentMethods.filter(
        provider => provider.country === 'Bangladesh' || provider.country === 'All'
      );
    } else {
      this.filterPaymentMethods = matchedPaymentMethods.filter(
        provider => provider.country !== 'Bangladesh' || provider.country === 'All'
      );
    }

    if (this.filterPaymentMethods.length) {
      this.selectedPaymentProvider = this.filterPaymentMethods[0].providerName;
      this.selectedPayment = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider);
      this.selectedPaymentProviderType = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider)?.providerType;
      this.onChangePaymentMethod.emit(this.selectedPaymentProvider);
      this.onChangePaymentType.emit(this.selectedPaymentProviderType);
      this.allPaymentMethod.emit(this.paymentMethodSetting);
    }
  }

  onSelectPaymentMethod(data: any) {
    this.selectedPaymentMethodLogo = data?.image;
    this.selectedPaymentProvider = data.providerName;
    this.selectedPayment = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider);
    this.selectedPaymentProviderType = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider)?.providerType;
    this.onChangePaymentMethod.emit(this.selectedPaymentProvider);
    this.onChangePaymentType.emit(this.selectedPaymentProviderType);
    this.allPaymentMethod.emit(this.paymentMethodSetting);
  }

  getForm(): FormGroup {
    return this.dataForm;
  }


  copyCouponCodes(accountNumber:any){
    // Use the Clipboard API to copy the coupon codes to the clipboard
    navigator.clipboard.writeText(accountNumber).then(() => {
      // this.uiService.success("Successfully copy account number'!");
      this.isCopied = true;
      this.uiService.message(`Copy the account number`, "warn");

      setTimeout(()=>{
        this.isCopied = false;
      }, 5000)
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
