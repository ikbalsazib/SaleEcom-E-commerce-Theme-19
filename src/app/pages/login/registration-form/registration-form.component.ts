import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UiService} from '../../../services/core/ui.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/common/user.service';
import {UtilsService} from '../../../services/core/utils.service';
import {environment} from '../../../../environments/environment';
import {Subscription} from 'rxjs';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass
  ]
})
export class RegistrationFormComponent implements OnInit, OnDestroy{

  @Input({required: true}) loginFormData: any;

  // Store Data
  dataForm: FormGroup;
  passwordStrength: string = 'weak';
  passwordVisibility = false;
  isLoading: boolean = false;
  navigateFrom: string;


  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly utilsService = inject(UtilsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Init Form
    this.initDataForm();
    const subscription = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam.get('navigateFrom')) {
        this.navigateFrom = qParam.get('navigateFrom');
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Form Methods
   * initDataForm()
   * onSubmit()
   * isFieldInvalid()
   * isEmailValid()
   * checkPasswordStrength()
   * togglePasswordVisibility()
   */

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Input validation failed.', 'warn');
      this.dataForm.markAllAsTouched();
      return;
    }
    await this.userSignupAndLogin();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.dataForm.get(field);
    return control.invalid && control.touched;
  }

  isEmailValid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.dataForm.value.email);
  }

  checkPasswordStrength() {
    const hasMinLength = this.dataForm.value.password.length >= 6;

    if (hasMinLength) {
      this.passwordStrength = 'strong';
    } else {
      this.passwordStrength = 'weak';
    }
  }

  togglePasswordVisibility() {
    this.passwordVisibility = !this.passwordVisibility;
  }


  /**
   * HTTP REQ HANDLE
   * userSignupAndLogin()
   */

  private async userSignupAndLogin() {
    this.isLoading = true;
    const data = {
      ...this.loginFormData,
      ...this.dataForm.value,
      ...{
        registrationType: 'phone',
        isPasswordLess: false,
      }
    }
    try {
      let navigateTo: string;
      if (this.utilsService.removeUrlQuery(this.router.url) === '/website-builder/auth') {
        navigateTo = '/website-builder/choose-theme'
      } else {
        navigateTo = environment.userBaseUrl;
      }

      await this.userService.userSignupAndLogin(data, navigateTo, this.navigateFrom);
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
    }

  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
