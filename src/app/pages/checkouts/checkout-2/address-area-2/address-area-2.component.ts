import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule, NgClass, TitleCasePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ADDRESS_TYPES } from '../../../../core/utils/app-data';
import { Division } from '../../../../interfaces/common/division.interface';
import { DeliveryCharge } from '../../../../interfaces/common/setting.interface';
import { User, UserAddress } from '../../../../interfaces/common/user.interface';
import { FilterData } from '../../../../interfaces/core/filter-data';
import { Select } from '../../../../interfaces/core/select';
import { DivisionService } from '../../../../services/common/division.service';
import { UserDataService } from '../../../../services/common/user-data.service';
import { UserService } from '../../../../services/common/user.service';
import { DivisionSelectBottomSheetComponent } from '../../../../shared/components/division-select-bottom-sheet/division-select-bottom-sheet.component';
import { TitleComponent } from "../../../../shared/components/title/title.component";
import { CurrencyCtrPipe } from '../../../../shared/pipes/currency.pipe';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-address-area-2',
  templateUrl: './address-area-2.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    TitleCasePipe,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TranslatePipe,
    CurrencyCtrPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioGroup,
    MatRadioButton,
    MatIconModule,
  ],
  styleUrl: './address-area-2.component.scss'
})
export class AddressArea2Component implements OnInit, OnChanges, OnDestroy {

  // Decorator
  @Input() user: User;
  // @Input() cityName!: string;
  @Input() needRefreshForm: boolean = false;
  @Input() deliveryOptionType!: any;
  @Input() productSetting!: any;
  @Input() orderPhoneValidation!: any;
  @Input() deliveryCharge: DeliveryCharge;
  @Output() formData = new EventEmitter<any>();
  @ViewChild('formElement') formElement: NgForm;
  @Input() country: any;

  filteredDivisions$ = new BehaviorSubject<any[]>([]);
  // divisionControl = new FormControl('');

  // Store Data
  addressTypes: Select[] = ADDRESS_TYPES;
  selectedAddress: UserAddress;
  addresses: UserAddress[] = [];
  titleData = 'Delivery Address';
  titleDataForDeliveryOption = 'Select Delivery Option';
  divisions?: Division[] = [];
  selectedCityOption: string | null = null;
  isMobile = false;


  // Form Control
  dataForm: FormGroup;


  private readonly userDataService = inject(UserDataService);
  private readonly divisionService = inject(DivisionService);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private breakpointObserver = inject(BreakpointObserver);
  @Inject(PLATFORM_ID) private platformId: Object;


  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
    this.getAllDivision();

    this.dataForm = this.fb.group({
      addressType: [''],
      name: ['', Validators.required],
      phoneNo: [''],
      division: [''],
      area: [''],
      zone: [''],
      shippingAddress: [''],
      email: [''],
    });

    // ✅ INITIAL PHONE VALIDATOR SETUP
    this.setPhoneNoValidator();

    this.dataForm.valueChanges.subscribe((value) => {
      if (this.productSetting?.productType === 'digitalProduct') {
        if (!this.productSetting?.digitalProduct?.isAddressEnable) {
          this.dataForm.get('shippingAddress')?.setValue('N/A', { emitEvent: false });
        }

        if (!this.productSetting?.digitalProduct?.isDivisionEnable) {
          this.dataForm.get('division')?.setValue('outside-dhaka', { emitEvent: false });
        }

        this.formData.emit(this.dataForm.getRawValue());
      } else {
        this.formData.emit(value);
      }
    });

    // Base Data
    if (this.userService.isUser) {
      this.getUserAddress();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.needRefreshForm) {
      this.dataForm.markAllAsTouched();
    }
    if (this.user && !this.addresses.length) {
      this.dataForm.patchValue({name: this.user?.name, phoneNo: this.user?.phoneNo});
    }

// ✅ Country চেঞ্জ হলে Validator রিফ্রেশ করো
    if (this.orderPhoneValidation) {
      this.setPhoneNoValidator();
    }

  }

  // setPhoneNoValidator() {
  //   if (!this.dataForm) return; // dataForm না থাকলে কিছু করো না
  //   const phoneNoControl = this.dataForm.get('phoneNo');
  //   phoneNoControl?.clearValidators();
  //
  //   if (this.country?.code === 'BD') {
  //     phoneNoControl?.setValidators([Validators.required, this.mobileOrEmailValidator]);
  //   } else {
  //     phoneNoControl?.setValidators([]); // বা ফাঁকা রাখতে পারো, যদি অন্য দেশে ফোন না লাগে
  //   }
  //
  //   phoneNoControl?.updateValueAndValidity();
  // }
  setPhoneNoValidator() {
    if (!this.dataForm) return;

    const phoneNoControl = this.dataForm.get('phoneNo');
    phoneNoControl?.clearValidators();

   if (this.orderPhoneValidation?.isEnableOutsideBd) {
      // ✅ Outside BD হলে config অনুযায়ী min/max
      const validators = [Validators.required];

      if (this.orderPhoneValidation?.minLength) {
        validators.push(Validators.minLength(this.orderPhoneValidation.minLength));
      }
      if (this.orderPhoneValidation?.maxLength) {
        validators.push(Validators.maxLength(this.orderPhoneValidation.maxLength));
      }

      phoneNoControl?.setValidators(validators);
    } else {
      // ✅ Bangladesh হলে regex validation
      phoneNoControl?.setValidators([
        Validators.required,
        this.mobileOrEmailValidator
      ]);
    }

    phoneNoControl?.updateValueAndValidity();
  }


  private getUserAddress() {
    const subscription = this.userDataService.getUserAddress().subscribe({
      next: res => {
        this.addresses = res.data;
        this.getNextAddressType();
        if (this.addresses.length) {
          this.selectedAddress = this.addresses[0];
          this.dataForm.patchValue(this.selectedAddress);
        }
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }


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
        this.filteredDivisions$.next(this.divisions);
      },
      error: err => {
        console.log(err);
      }
    });
    this.subscriptions?.push(subscription);
  }

  /***
   * On Selection Change
   * onChangeDivision()
   * onChangeArea()
   */

  onSelectAddress(item: UserAddress) {
    this.selectedAddress = item;
    this.dataForm.patchValue(this.selectedAddress);
  }

  onAddNewAddress() {
    this.selectedAddress = null;
    this.formElement.resetForm();
    this.getNextAddressType();
  }

  getNextAddressType() {
    const usedTypes = this.addresses.map(addr => addr.addressType);
    const unusedType = this.addressTypes.find(type => !usedTypes.includes(type.value));
    const result = unusedType ? unusedType.value : null;
    this.dataForm.patchValue({addressType: result});
  }

  private filterDivisions(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.divisions.filter(division =>
      division.name.toLowerCase().includes(filterValue)
    );
  }


  restrictMaxLength(event: any): void {
    const input = event.target;
    if (input.value.length > 11) {
      input.value = input.value.slice(0, 11);
    }
    this.dataForm.get('phoneNo')?.setValue(input.value);
  }

  mobileOrEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
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

  openDivisionSelectMobile() {
    this.bottomSheet.open(DivisionSelectBottomSheetComponent, {
      data: {
        options: this.divisions,
        selectedDivision: this.dataForm.get('division').value
      }
    }).afterDismissed().subscribe(selected => {
      if (selected) {
        this.dataForm.get('division').setValue(selected.name);
      }
    });
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
