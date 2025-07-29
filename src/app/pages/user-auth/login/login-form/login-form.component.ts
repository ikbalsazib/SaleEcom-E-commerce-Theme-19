import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {UiService} from '../../../../services/core/ui.service';
import {UserService} from '../../../../services/common/user.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {UtilsService} from '../../../../services/core/utils.service';
import {environment} from '../../../../../environments/environment';
import {OtpService} from '../../../../services/common/otp.service';
import {SocialLogin} from '../../../../interfaces/common/setting.interface';
import {ScriptLoaderService} from '../../../../services/core/script-loader.service';
import {isPlatformBrowser, NgClass} from '@angular/common';
import {OtpInputComponent} from "../../../../shared/components/otp-input/otp-input.component";

export function emailOrPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // No validation error if the field is empty (use `Validators.required` separately if needed)
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^\d{10,}$/;

    if (emailPattern.test(value) || phonePattern.test(value)) {
      return null; // Valid input (either email or phone number)
    }

    return { emailOrPhone: true }; // Invalid input
  };
}
declare const google: any;

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    OtpInputComponent,
    RouterLink
  ]
})
export class LoginFormComponent implements OnInit, OnChanges, OnDestroy {

  // Decorator
  @Input() socialLogins: SocialLogin[] = [];
  @Output() onLoginFormSubmit = new EventEmitter();
  @Output() onTypeChange = new EventEmitter();

  // Store Data
  dataForm: FormGroup;
  type: 'login' | 'signup' | '' = 'login';
  isLoading: boolean = false;
  otpCode: string = null;
  isInvalidOtp: boolean = false;
  countryCode = '+88'
  navigateFrom: string;
  passwordStrength: string = 'weak';
  passwordVisibility = false;
  isEmail: boolean | undefined = undefined;
  isSvg:boolean = true;

  // Inject
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly otpService = inject(OtpService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly scriptLoaderService = inject(ScriptLoaderService);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit() {
    // Initialize Script
    this.initGoogleGsiScript();

    const subscription = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam.get('navigateFrom')) {
        this.navigateFrom = qParam.get('navigateFrom');
      }
    });
    this.subscriptions?.push(subscription);
    // Init Form
    this.initDataForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.socialLogins.length && this.isSocialLoginEnable('Google')) {
      const clientId = this.socialLogins.find(f => f.providerName === 'Google').authId
      this.initGoogleLogin(clientId);
    }
  }

  /**
   * Initialize with Script
   * initGoogleGsiScript()
   */

  private initGoogleGsiScript() {
    this.scriptLoaderService
      .loadGoogleGsiScript('https://accounts.google.com/gsi/client', 'google-gsi')
      .then(() => {

      })
      .catch((error) => {
        console.error('Error loading Google Identity script:', error);
      });

  }


  /**
   * Form Methods
   * initDataForm()
   * onSubmit()
   * isFieldInvalid()
   * checkPasswordStrength()
   */

  private initDataForm() {
    this.dataForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          emailOrPhoneValidator()
        ]
      ],
      password: [''],
    });
  }

  async onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Enter a valid phone number', 'warn');
      this.dataForm.markAllAsTouched();
      return;
    }

    await this.userLogin();

  }

  isFieldInvalid(field: string): boolean {
    const control = this.dataForm.get(field);
    return control.invalid && control.touched;
  }

  checkPasswordStrength() {
    const hasMinLength = this.dataForm.value.password.length >= 6;

    if (hasMinLength) {
      this.passwordStrength = 'strong';
    } else {
      this.passwordStrength = 'weak';
    }
  }


  /**
   * UI LOGIC
   * onEditPhoneNo()
   * onOtpEnter()
   * togglePasswordVisibility()
   * btnName()
   * navigateToForgetPassword()
   */
  onEditPhoneNo() {
    this.type = '';
  }

  // onOtpEnter(value: string) {
  //   this.otpCode = value;
  //   if (this.otpCode) {
  //     this.validateOtpWithPhoneNo();
  //   }
  //
  // }

  togglePasswordVisibility() {
    this.passwordVisibility = !this.passwordVisibility;
  }

  get btnName() {
    if (this.type === 'signup') {
      return 'Validate';
    } else if (this.type === 'login') {
      return 'Login';
    } else {
      return 'Submit'
    }
  }

  navigateToForgetPassword() {
    this.router.navigate(['forget-password'], {
      queryParams: {
        navigateFrom: this.utilsService.removeUrlQuery(this.router.url),
        username: this.dataForm.value.username
      }
    }).then();
  }


  /**
   * HTTP REQ HANDLE
   * checkUserWithPhoneNo()
   * validateOtpWithPhoneNo()
   * userLogin()
   */

  // private checkUserWithPhoneNo() {
  //   this.isLoading = true;
  //   const subscription = this.userService.checkUserWithPhoneNo({
  //     username: this.dataForm.value.username,
  //     countryCode: this.countryCode
  //   })
  //     .subscribe({
  //       next: res => {
  //         this.isLoading = false;
  //         this.type = res.data.type;
  //         if (this.type === 'signup') {
  //           this.uiService.message(res.message, 'success')
  //         } else {
  //           this.onTypeChange.emit(this.type);
  //         }
  //       },
  //       error: err => {
  //         console.log(err);
  //         this.isLoading = false;
  //       }
  //     });
  //   this.subscriptions?.push(subscription);
  // }

  // private validateOtpWithPhoneNo() {
  //   this.isLoading = true;
  //   const subscription = this.otpService.validateOtpWithPhoneNo({
  //     username: this.dataForm.value.username,
  //     code: this.otpCode
  //   })
  //     .subscribe({
  //       next: res => {
  //         this.isLoading = false;
  //         if (res.success) {
  //           this.onTypeChange.emit(this.type);
  //           this.onLoginFormSubmit.emit({...this.dataForm.value, ...{countryCode: this.countryCode}});
  //         } else {
  //           this.uiService.message(res.message, 'warn');
  //           this.isInvalidOtp = true;
  //         }
  //
  //       },
  //       error: err => {
  //         console.log(err);
  //         this.isLoading = false;
  //       }
  //     });
  //   this.subscriptions?.push(subscription);
  // }

  private async userLogin() {
    this.isLoading = true;
    const data = {
      username: this.dataForm.value.username,
      password: this.dataForm.value.password
    }
    try {
      let navigateTo: string;
      if (this.utilsService.removeUrlQuery(this.router.url) === '/website-builder/auth') {
        navigateTo = '/website-builder/choose-theme'
      } else {
        navigateTo = environment.userBaseUrl;
      }
      await this.userService.userLogin(data, navigateTo, this.navigateFrom);

      this.isLoading = false;
    } catch (err) {
      console.log(err)
      if (err?.message === 'Password not matched!') {
        this.dataForm.get('password').setErrors({'incorrect': true});
        this.dataForm.get('password').markAsTouched();
      }
      this.isLoading = false;
    }

  }

  /**
   * Social Login Methods
   * isSocialLoginEnable()
   */

  isSocialLoginEnable(providerName: string) {
    const fData = this.socialLogins.find(f => f.providerName === providerName);
    return !!fData;
  }

  /**
   * Google Auth
   * initGoogleLogin()
   * onGoogleLogin()
   * handleGoogleCallback()
   */
  private initGoogleLogin(clientId: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleGoogleCallback.bind(this),
          auto_select: false,
        });
      }
    }
  }

  onGoogleLogin(): void {
    // IMPORTANT: For Check From Local Host : Must Add localhost & localhost:4200 in the JavaScript Origin
    google.accounts.id.prompt();
  }

  private handleGoogleCallback(response: any): void {
    const token = response.credential;
    try {
      this.userService.verifyGoogleLoginWithToken({token: token}, '/', this.navigateFrom)
    } catch (err) {
      console.log(err)
    }
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
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }


}
