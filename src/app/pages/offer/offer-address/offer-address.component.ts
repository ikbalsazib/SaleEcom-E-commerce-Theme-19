import {
  Component,
  EventEmitter, HostListener,
  inject,
  Input,
  OnChanges, OnDestroy,
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

@Component({
  selector: 'app-offer-address',
  templateUrl: './offer-address.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  styleUrl: './offer-address.component.scss'
})
export class OfferAddressComponent implements OnInit, OnChanges, OnDestroy {

  // Decorator
  @Input() needRefreshForm: boolean = false;
  @Output() formData = new EventEmitter<any>();
  @ViewChild('selectContainer') selectContainer;
  @ViewChild('formElement') formElement: NgForm;

  // Store Data
  addresses: UserAddress[] = [];
  divisions?: Division[] = [];
  selectedDivision: string | null = null;
  dropdownVisible = false;

  // Form Data
  dataForm: FormGroup;

  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly divisionService = inject(DivisionService);

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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.needRefreshForm) {
      this.dataForm.markAllAsTouched();
    }
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


  restrictMaxLength(event: any): void {
    const input = event.target;
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
    this.dataForm.patchValue({division: item});
    this.dropdownVisible = false;
  }

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.selectContainer.nativeElement.contains(event.target);
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
