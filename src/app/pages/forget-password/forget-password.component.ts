import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ReactiveFormsModule} from "@angular/forms";
import {PasswordResetFormComponent} from "./password-reset-form/password-reset-form.component";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
  standalone: true,
  imports: [
    PasswordResetFormComponent,
    ReactiveFormsModule
  ]
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {

  // Store Data
  navigateFrom: string;
  phoneNo: string;

  // Inject
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const subscription = this.activatedRoute.queryParamMap.subscribe(qParams => {
      if (qParams.get('navigateFrom')) {
        this.navigateFrom = qParams.get('navigateFrom');
      }
      if (qParams.get('phoneNo')) {
        this.phoneNo = qParams.get('phoneNo');
      }
    })
    this.subscriptions?.push(subscription);
  }


  onBack() {
    if (this.navigateFrom) {
      this.router.navigate([this.navigateFrom]).then();
    } else {
      this.router.navigate(['/login']).then();
    }

  }

  /**
   * ON Destroy
   */

  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
