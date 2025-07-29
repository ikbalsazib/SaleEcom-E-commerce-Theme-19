import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {SettingService} from '../../../../services/common/setting.service';
import {Subscription} from 'rxjs';
import {PaymentCardLoaderComponent} from '../../../../shared/loader/payment-card-loader/payment-card-loader.component';
import {UserOffer} from '../../../../interfaces/common/setting.interface';
import {RouterLink} from '@angular/router';
import {UserService} from '../../../../services/common/user.service';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss',
  imports: [
    PaymentCardLoaderComponent,
    RouterLink
  ],
  standalone: true
})
export class OffersComponent implements OnInit, OnDestroy {

  // Store Data
  isHide: boolean = false;
  userOffers: UserOffer[] = [];
  registrationOffer: UserOffer;
  isHydrated = false;

  // Inject
  private readonly settingService = inject(SettingService);
  protected readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Base Data
    this.checkHydrated();
    this.getOffers();
  }

  /**
   * Hydrated Manage
   * checkHydrated()
   */

  protected checkHydrated() {
    if (isPlatformBrowser(this.platformId)) {
      this.isHydrated = true;
    }
  }


  /**
   * HTTP Req Handle
   * getOffers()
   */

  private getOffers() {
    const subscription = this.settingService.getOffers()
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.userOffers = res.data;
            if (this.userOffers.length) {
              this.registrationOffer = this.userOffers.find(f => f.offerType === 'new-registration');
            }
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
