import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {User} from "../../../../interfaces/common/user.interface";
import {Subscription} from "rxjs";
import {UserDataService} from "../../../../services/common/user-data.service";
import {UiService} from "../../../../services/core/ui.service";
import {ReloadService} from "../../../../services/core/reload.service";
import {UserService} from "../../../../services/common/user.service";

@Component({
  selector: 'app-password-manage',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './password-manage.component.html',
  styleUrl: './password-manage.component.scss'
})
export class PasswordManageComponent implements OnInit, OnDestroy {

  // Store Data
  dataForm!: FormGroup;
  user?: User | any;
  passwordVisibility = false;
  oldPasswordVisibility = false;
  confirmPasswordVisibility = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Inject
  private readonly fb = inject(FormBuilder);
  private readonly userDataService = inject(UserDataService);
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);
  protected readonly userService = inject(UserService);

  ngOnInit(): void {
    this.initializeForm();
    this.handleRefresh();
    if (this.userService.isUser) {
      this.getLoggedInUserInfo();
    }
  }

  /**
   * Initialize Form
   */
  private initializeForm(): void {
    this.dataForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Handle Data Refresh
   */
  private handleRefresh(): void {
    const subscription = this.reloadService.refreshData$.subscribe(() => {
      this.getLoggedInUserInfo();
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * Handle Form Submission
   */
  onSubmit(): void {
    if (this.dataForm.valid) {
      if (this.dataForm.value.password === this.dataForm.value.confirmPassword) {
        const data = {
          password: this.dataForm.value.password,
          oldPassword: this.dataForm.value.oldPassword,
        };
        this.changeLoggedInUserPassword(data);
      } else {
        this.uiService.message("Password didn't match", 'warn');
      }
    } else {
      this.dataForm.markAllAsTouched();
      this.uiService.message('Form validation failed', 'warn');
    }
  }

  private changeLoggedInUserPassword(data: any): void {
    const sub = this.userDataService.changeLoggedInUserPassword(data).subscribe({
      next: res => {
        this.uiService.message(res.message, res.success ? 'success' : 'warn');
      }
    });
    this.subscriptions?.push(sub);
  }

  /**
   * UI Logic
   * Toggle Password Visibility
   */
  togglePasswordVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  toggleOldPasswordVisibility(): void {
    this.oldPasswordVisibility = !this.oldPasswordVisibility;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisibility = !this.confirmPasswordVisibility;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.dataForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /**
   * Fetch User Info
   */
  private getLoggedInUserInfo(): void {
    const subscription = this.userDataService.getLoggedInUserData().subscribe({
      next: res => {
        if (res) {
          this.user = res.data;
        }
      }
    });
    this.subscriptions?.push(subscription);
  }

  updateLoggedInUserInfo(data: any): void {
    const subscription = this.userDataService.updateLoggedInUserInfo(data).subscribe({
      next: res => {
        if (res) {
          this.uiService.message(res.message, 'success');
          this.reloadService.needRefreshData$();
        }
      }
    });
    this.subscriptions?.push(subscription);
  }

  statusChange(data: string): void {
    this.updateLoggedInUserInfo({ status: data });
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
