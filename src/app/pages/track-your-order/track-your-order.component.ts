import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {OtpInputComponent} from "../../shared/components/otp-input/otp-input.component";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UiService} from "../../services/core/ui.service";
import {OtpService} from "../../services/common/otp.service";
import {Router, RouterLink} from "@angular/router";
import {UserDataService} from "../../services/common/user-data.service";
import {Subscription} from "rxjs";
import {NgClass} from "@angular/common";
import {emailOrPhoneValidator} from "../user-auth/login/login-form/login-form.component";

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value?.startsWith('01') ? null : { invalidPhoneNumber: true };
  };
}

@Component({
  selector: 'app-track-your-order',
  standalone: true,
  imports: [
    OtpInputComponent,
    ReactiveFormsModule,
    NgClass,
    RouterLink
  ],
  templateUrl: './track-your-order.component.html',
  styleUrl: './track-your-order.component.scss'
})
export class TrackYourOrderComponent implements OnInit, OnDestroy {

  // Decorators
  @Input() navigateFrom!: string;
  @Input() phoneNo!: string;

  // Store Data
  dataForm!: FormGroup;
  type: 'track-order' | '' = '';
  isLoading = false;
  otpCode: string | null = null;
  isInvalidOtp = false;
  isOtpValid = false;
  countryCode = '+88';
  passwordStrength = 'weak';
  passwordVisibility = false;
  isEmail: boolean | undefined = undefined;
  isSvg:boolean = true;
  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly otpService = inject(OtpService);
  private readonly router = inject(Router);
  private readonly userDataService = inject(UserDataService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initDataForm();
    if (this.phoneNo) {
      this.dataForm.patchValue({ phoneNo: this.phoneNo });
    }
  }

  /**
   * Initialize Form
   */
  private initDataForm(): void {
    this.dataForm = this.fb.group({
      username: ['', [
        Validators.required,
        emailOrPhoneValidator()
      ]], password: [''],
    });
  }

  /**
   * Handle Form Submission
   */
  onSubmit(): void {
    if (this.dataForm.invalid) {
      this.uiService.message('Enter a valid phone number', 'warn');
      this.dataForm.markAllAsTouched();
      return;
    }

    if (this.type === 'track-order' && !this.isOtpValid) {
      this.otpCode ? this.validateOtpWithPhoneNo() : (this.isInvalidOtp = true);
    } else if (this.type === 'track-order' && this.isOtpValid) {
      this.resetUserPassword();
    } else {
      this.checkUserWithPhoneNoOrEmailForResetPassword();
    }
  }

  isFieldInvalid(field: string): boolean {
    return this.dataForm.get(field)?.invalid && this.dataForm.get(field)?.touched;
  }

  checkPasswordStrength(): void {
    this.passwordStrength = this.dataForm.value.password.length >= 6 ? 'strong' : 'weak';
  }

  onEditPhoneNo(): void {
    this.type = '';
  }

  onOtpEnter(value: string): void {
    this.otpCode = value;
    this.validateOtpWithPhoneNo();
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  get btnName(): string {
    return this.type === 'track-order' && !this.isOtpValid ? 'Verify Code' : this.type === 'track-order' && this.isOtpValid ? 'Change Password' : 'Sent Otp Code';
  }

  /**
   * HTTP Requests
   */
  private checkUserWithPhoneNoOrEmailForResetPassword(): void {
    this.isLoading = true;
    const sub = this.userDataService.checkUserWithPhoneNoOrEmailForResetPassword({
      username: this.dataForm.value.username,

    }).subscribe({
      next: res => {
        this.isLoading = false;
        this.type = res.success ? res.data.type : '';
        this.uiService.message(res.message, res.success ? 'success' : 'warn');
      },
      error: () => this.isLoading = false
    });
    this.subscriptions?.push(sub);
  }

  private validateOtpWithPhoneNo(): void {
    this.isLoading = true;
    const sub = this.otpService.validateOtpWithPhoneNo({
      phoneNo: this.dataForm.value.phoneNo,
      countryCode: this.countryCode,
      code: this.otpCode
    }).subscribe({
      next: res => {
        this.isLoading = false;
        this.isOtpValid = res.success;
        if (!res.success) this.uiService.message(res.message, 'warn');
      },
      error: () => this.isLoading = false
    });
    this.subscriptions?.push(sub);
  }

  private resetUserPassword(): void {
    this.isLoading = true;
    const sub = this.userDataService.resetUserPassword({ ...this.dataForm.value, countryCode: this.countryCode }).subscribe({
      next: res => {
        this.isLoading = false;
        this.uiService.message(res.message, res.success ? 'success' : 'warn');
        if (res.success) {
          this.router.navigate([this.navigateFrom || '/login']).then();
        }
      },
      error: () => this.isLoading = false
    });
    this.subscriptions?.push(sub);
  }


  onInputChange(value: string) {
    if (value.length === 0) {
      this.isEmail = false;
      this.isSvg = true; // Make isSvg true when input length is 0
      return;
    }

    const emailFormat = /[a-zA-Z@]/;

    if (emailFormat.test(value)) {
      this.isEmail = true;
      this.isSvg = false;
    } else if (/^\d+$/.test(value)) {
      this.isEmail = false;
      this.isSvg = false;
    } else {
      this.isEmail = false;
      this.isSvg = true;
    }
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
