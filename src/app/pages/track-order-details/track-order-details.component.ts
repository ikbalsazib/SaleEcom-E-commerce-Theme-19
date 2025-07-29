import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AccountSidebarComponent} from "../../shared/components/account-sidebar/account-sidebar.component";
import {ButtonLoaderComponent} from "../../shared/loader/button-loader/button-loader.component";
import {FormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {MobileHeaderComponent} from "../../shared/components/core/mobile-header/mobile-header.component";
import {OrderDetailsProductsComponent} from "../order-details/order-details-products/order-details-products.component";
import {
    OrderDetailsShippingaddressComponent
} from "../order-details/order-details-shippingaddress/order-details-shippingaddress.component";
import {OrderDetailsTimelineComponent} from "../order-details/order-details-timeline/order-details-timeline.component";
import {OrderLoaderComponent} from "../../shared/loader/order-loader/order-loader.component";
import {ProfileLoaderComponent} from "../../shared/loader/profile-loader/profile-loader.component";
import {
    ShippingAddressLoaderComponent
} from "../../shared/loader/shipping-address-loader/shipping-address-loader.component";
import {TimelineLoaderComponent} from "../../shared/loader/timeline-loader/timeline-loader.component";
import {TitleCasePipe} from "@angular/common";
import {Order} from "../../interfaces/common/order.interface";
import {OrderService} from "../../services/common/order.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {UiService} from "../../services/core/ui.service";
import {ReloadService} from "../../services/core/reload.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-track-order-details',
  standalone: true,
  imports: [
    AccountSidebarComponent,
    ButtonLoaderComponent,
    FormsModule,
    MatIcon,
    MobileHeaderComponent,
    OrderDetailsProductsComponent,
    OrderDetailsShippingaddressComponent,
    OrderDetailsTimelineComponent,
    OrderLoaderComponent,
    ProfileLoaderComponent,
    ShippingAddressLoaderComponent,
    TimelineLoaderComponent,
    TitleCasePipe,
    RouterLink
  ],
  templateUrl: './track-order-details.component.html',
  styleUrl: './track-order-details.component.scss'
})
export class TrackOrderDetailsComponent implements OnInit, OnDestroy {

  // Store Data
  id: string;
  order: Order | null = null;
  showCancelPopup: boolean = false;
  cancellationReason: string = '';
  isLoading = true;

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subscription = this.activatedRoute.paramMap.subscribe(param => {
      this.id = param.get('id');
      if (this.id) {
        this.getOrderByIds();
      }
    })
    this.subscriptions?.push(subscription);

    setTimeout(() => {
      this.isLoading = false;
    }, 100);

  }


  /**
   * HTTP REQUEST HANDLE
   * getOrderByIds()
   */
  private getOrderByIds(): void {
    const subscription= this.orderService.getOrderByIds(this.id)
      .subscribe({
        next: (res) => {
          this.order = res.data;
        },
        error: (err) => {
          console.error('Error fetching order:', err);
        }
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * openCancelPopup
   * closeCancelPopup
   * submitCancellation
   * cancelOrder
   */

  openCancelPopup() {
    this.showCancelPopup = true;
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
    this.cancellationReason = '';
  }

  submitCancellation() {
    if (this.cancellationReason) {
      this.cancelOrder(this.cancellationReason);
      this.closeCancelPopup();
    } else {
      alert('Please provide a reason for cancellation.');
    }
  }

  cancelOrder(reason: any) {
    const data:any = {
      orderStatus:'cancelled',
      cancelReason:reason
    }
    const subscription = this.orderService.updateOrderById(this.id, data).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.message('Order Successfully Cancelled',"success");
          this.reloadService.needRefreshData$();
        }
      },
      error: (err) => {
        console.error('Error fetching order:', err);
      }
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
