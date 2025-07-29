import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UtilsService} from '../../services/core/utils.service';
import {SettingService} from '../../services/common/setting.service';
import {SocialLogin} from '../../interfaces/common/setting.interface';
import {Subscription} from 'rxjs';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NoWhitespaceDirective} from "../../shared/directives/no-whitespace.directive";
import {OnlyNumberDirective} from "../../shared/directives/number-only.directive";
import {OtpInputComponent} from "../../shared/components/otp-input/otp-input.component";
import {LoginFormComponent} from "./login-form/login-form.component";
import {RegistrationFormComponent} from "./registration-form/registration-form.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    NoWhitespaceDirective,
    OnlyNumberDirective,
    OtpInputComponent,
    ReactiveFormsModule,
    LoginFormComponent,
    RegistrationFormComponent
  ]
})
export class LoginComponent implements OnInit, OnDestroy {

  // Store Data
  socialLogins: SocialLogin[] = [];
  loginFormValue: any;
  currentUrl: string;
  type: 'login' | 'signup' | '' = '';

  // Inject
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly settingService = inject(SettingService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.currentUrl = this.utilsService.removeUrlQuery(this.router.url);

    // Base Data
    this.getSocialLogins();
  }


  /**
   * HTTP REQUEST HANDLE
   * getSocialLogins()
   */
  private getSocialLogins() {
    const subscription = this.settingService.getSocialLogins()
      .subscribe({
        next: (res) => {
          this.socialLogins = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * onLoginFormSubmit()
   * onTypeChange()
   * title()
   * description()
   * onBack()
   */
  onLoginFormSubmit(event: any) {
    this.loginFormValue = event;
  }

  onTypeChange(event: any) {
    this.type = event;
  }

  get title() {
    if (this.type === 'login') {
      return 'Login'
    } else if (this.type === 'signup') {
      return 'Signup'
    } else {
      return 'Login or Signup'
    }
  }

  get description() {
    if (this.type === 'login') {
      return 'Please enter your valid phone number and password for login.'
    } else if (this.type === 'signup') {
      return 'Please enter your valid information for signup.'
    } else {
      return 'Please continue with your phone number. we will auto-detect you can login or sign up'
    }
  }

  onBack() {
    if (this.type === 'signup') {
      this.type = '';
    } else {
      this.router.navigate(['/website-builder/choose-color']).then()
    }
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
