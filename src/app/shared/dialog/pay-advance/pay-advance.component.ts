import {Component, Inject, inject, OnInit} from '@angular/core';
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {PaymentCardLoaderComponent} from "../../loader/payment-card-loader/payment-card-loader.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SafeHtmlCustomPipe} from "../../pipes/safe-html.pipe";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {PAYMENT_METHODS} from "../../../core/utils/app-data";
import {UiService} from "../../../services/core/ui.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CurrencyCtrPipe} from '../../pipes/currency.pipe';

@Component({
  selector: 'app-pay-advance',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    PaymentCardLoaderComponent,
    ReactiveFormsModule,
    SafeHtmlCustomPipe,
    TranslatePipe,
    CurrencyCtrPipe
  ],
  templateUrl: './pay-advance.component.html',
  styleUrl: './pay-advance.component.scss'
})
export class PayAdvanceComponent implements OnInit {

  // Store Data
  paymentMethods: any[] = [];
  isLoading: boolean = false;
  dataForm: FormGroup;
  allPaymentMethods: any[] = PAYMENT_METHODS;
  filterPaymentMethods: any[] = [];

  // Payment Data
  titleData = 'Select a Payment Option';
  selectedPaymentProvider: string;
  selectedPaymentProviderType: string;
  selectedPayment: any;

  // Inject
  private readonly fb = inject(FormBuilder);
  private uiService = inject(UiService)

  constructor(
    public dialogRef: MatDialogRef<PayAdvanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    // Base Data
    if (this.data.paymentProviders && this.data.paymentProviders.length) {
      this.paymentMethods = this.data.paymentProviders;
      this.getFilterPaymentMethods();
    }

    this.dataForm = this.fb.group({
      customerPaymentNo: [''],
      paymentTransactionId: [''],
    });
  }


  /**
   * UI LOGIC
   * getFilterPaymentMethods()
   * onSelectPaymentMethod()
   */
  getFilterPaymentMethods() {
    const paymentProviders = new Set(this.paymentMethods.map(m => m.providerName));

    this.filterPaymentMethods = this.allPaymentMethods.filter(f =>
      paymentProviders.has(f.providerName)
    );

    if (this.filterPaymentMethods.length) {
      this.selectedPaymentProvider = this.filterPaymentMethods[0].providerName;
      this.selectedPayment = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider);
      this.selectedPaymentProviderType = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider)?.providerType;
    }
  }

  get providerLogo(): string {
    return this.filterPaymentMethods.find(f => f.providerName === this.selectedPaymentProvider)?.image ?? 'https://cdn.saleecom.com/upload/images/placeholder.png';
  }


  onSelectPaymentMethod(data: any) {
    this.selectedPaymentProvider = data.providerName;
    this.selectedPayment = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider);
    this.selectedPaymentProviderType = this.paymentMethods.find(f => f.providerName === this.selectedPaymentProvider)?.providerType;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * UI Methods
   * onConfirmOrder()
   */
  public onConfirmOrder() {

    if (!this.selectedPaymentProvider) {
      this.uiService.message('Please select a payment method', "warn")
      return;
    }

    if (this.dataForm.invalid) {
      this.uiService.message('Sorry! Payment information is required', "warn");
      return;
    }

    const mData = {
      ...this.dataForm.value,
      ...{
        providerName: this.selectedPaymentProvider,
        providerType: this.selectedPaymentProviderType,
      }
    }
    this.dialogRef.close(mData);

  }

}
