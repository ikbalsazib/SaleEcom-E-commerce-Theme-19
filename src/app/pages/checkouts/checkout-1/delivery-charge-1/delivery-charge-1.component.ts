import {Component, EventEmitter, inject, OnDestroy, OnInit, Output} from '@angular/core';
import {SettingService} from '../../../../services/common/setting.service';
import {Subscription} from 'rxjs';
import {DeliveryCharge} from '../../../../interfaces/common/setting.interface';
import {ReloadService} from '../../../../services/core/reload.service';
import {TitleComponent} from "../../../../shared/components/title/title.component";
import {PaymentCardLoaderComponent} from "../../../../shared/loader/payment-card-loader/payment-card-loader.component";

@Component({
  selector: 'app-delivery-charge',
  templateUrl: './delivery-charge-1.component.html',
  standalone: true,
  imports: [
    TitleComponent,
    PaymentCardLoaderComponent
  ],
  styleUrl: './delivery-charge-1.component.scss'
})
export class DeliveryCharge1Component implements OnInit, OnDestroy {

  // Decorator
  @Output() onChangeDeliveryCharge = new EventEmitter<DeliveryCharge>();

  // Store Data
  deliveryCharges: DeliveryCharge[] = [];
  isLoading: boolean = true;

  selectedDeliveryCharge: DeliveryCharge;
  titleData = `Select a Delivery Option`;

  // Inject
  private readonly settingService = inject(SettingService);
  private readonly reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {

    // Reload Data
    const subscription = this.reloadService.refreshDeliveryCharge$.subscribe(() => {
      this.getDeliveryCharge();
    });
    this.subscriptions?.push(subscription);

    // Base Data
    this.getDeliveryCharge();
  }


  /**
   * HTTP Req Handle
   * getDeliveryCharge()
   */

  private getDeliveryCharge() {
    const subscription = this.settingService.getDeliveryCharge()
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.deliveryCharges = res.data;
          if (this.deliveryCharges.length) {
            if (this.selectedDeliveryCharge) {
              this.selectedDeliveryCharge = this.deliveryCharges.find(f => f.type === this.selectedDeliveryCharge.type);
              this.onChangeDeliveryCharge.emit(this.selectedDeliveryCharge);
            } else {
              this.selectedDeliveryCharge = this.deliveryCharges[0];
              this.onChangeDeliveryCharge.emit(this.selectedDeliveryCharge);
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
   * UI LOGIC
   * onSelectDeliveryCharge()
   * getDeliveryTypeImage()
   */
  onSelectDeliveryCharge(data: DeliveryCharge) {
    this.selectedDeliveryCharge = data;
    this.onChangeDeliveryCharge.emit(this.selectedDeliveryCharge);
  }

  getDeliveryTypeImage(type: string): string {
    switch (type) {
      case 'regular':
        return 'https://cdn.saleecom.com/upload/static/regular_delivery_200px.png';
      case 'express':
        return 'https://cdn.saleecom.com/upload/static/express_delivery_200px.png';
      case 'free':
        return 'https://cdn.saleecom.com/upload/static/free_delivery_200px.png';
      default:
        return 'https://cdn.saleecom.com/upload/static/regular_delivery_200px.png';
    }
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
