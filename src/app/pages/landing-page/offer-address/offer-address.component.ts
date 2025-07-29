import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {UserAddress} from "../../../interfaces/common/user.interface";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/core/filter-data";
import {DivisionService} from "../../../services/common/division.service";
import {Division} from "../../../interfaces/common/division.interface";
import {CurrencyCtrPipe} from "../../../shared/pipes/currency.pipe";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {SettingService} from "../../../services/common/setting.service";
import {DeliveryCharge} from "../../../interfaces/common/setting.interface";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-offer-address',
  templateUrl: './offer-address.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyCtrPipe,
    MatRadioButton,
    MatRadioGroup,
    TranslatePipe
  ],
  styleUrl: './offer-address.component.scss'
})
export class OfferAddressComponent implements OnInit, OnChanges, OnDestroy {

  // Decorator
  @Input() needRefreshForm: boolean = false;
  @Input() deliveryCharge: DeliveryCharge;
  @Output() formData = new EventEmitter<any>();
  @ViewChild('selectContainer') selectContainer;
  @ViewChild('formElement') formElement: NgForm;

  // Store Data
  addresses: UserAddress[] = [];
  divisions?: Division[] = [];
  selectedDivision: string | null = null;
  dropdownVisible = false;
  deliveryOptionType: any;
  selectedAddress: UserAddress;

  // Form Data
  dataForm: FormGroup;

  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly divisionService = inject(DivisionService);
  private readonly settingService = inject(SettingService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      phoneNo: [null, [Validators.required, this.mobileOrEmailValidator]],
      shippingAddress: [null, Validators.required],
      division: [null, Validators.required],
    });

    this.dataForm.valueChanges.subscribe((value) => {
      this.formData.emit(value);
    });

    // Base Data
    this.getAllDivision();
    this.getSetting();
    this.getDeliveryCharge();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.needRefreshForm) {
      this.dataForm.markAllAsTouched();
    }
  }

  /**
   * HTTP Req Handle
   * getDeliveryCharge()
   */

  private getDeliveryCharge() {
    // const subscription = this.settingService.getDeliveryChargesEasyCheckout(this.division)
    //   .subscribe({
    //     next: (res) => {
    //       this.isLoading = false;
    //       this.deliveryCharges = res.data;
    //     },
    //     error: (error) => {
    //       console.log(error);
    //     },
    //   });
    // this.subscriptions?.push(subscription);
  }
  /**
   * HTTP REQUEST HANDLE
   * getAllDivision()
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

  private getSetting() {
    const subscription = this.settingService.getSetting('orderSetting deliveryOptionType')
      .subscribe({
        next: res => {
          this.deliveryOptionType = res.data?.deliveryOptionType;
          setTimeout(() => {
            if (
              this.deliveryOptionType?.isEnableInsideCityOutsideCity &&
              this.deliveryCharge?.city
            ) {
              this.dataForm.patchValue({division: this.deliveryCharge.city});
            }
          }, 100);

          // if (res.data?.advancePayment && res.data?.advancePayment.length) {
          //   this.advancePayment = res.data.advancePayment.filter(f => f.status === 'active');
          // }

        },
        error: err => {
          console.log(err)
        }
      });
    this.subscriptions.push(subscription);
  }



  restrictMaxLength(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ''); // Only keep digits
    if (input.value.length > 11) {
      input.value = input.value.slice(0, 11);
    }
    this.dataForm.get('phoneNo')?.setValue(input.value);
  }

  mobileOrEmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const isMobile = /^(?:\+88)?01[3-9]\d{8}$/.test(value);

    if (!isMobile) {
      return { invalidInput: true };
    }
    if (isMobile && value.length > 11) {
      return { maxlength: true };
    }
    return null;
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  selectDivision(item: any) {
    this.selectedDivision = item.name;
    this.dataForm.patchValue({division: item?.name});
    this.dropdownVisible = false;
  }

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.selectContainer?.nativeElement?.contains(event.target);
    if (!clickedInside) {
      this.dropdownVisible = false;
    }
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
