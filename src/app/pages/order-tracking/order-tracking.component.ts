import {Component, inject, Input, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Order} from "../../interfaces/common/order.interface";
import {FilterData} from "../../interfaces/core/filter-data";
import {OrderService} from "../../services/common/order.service";
import {Subscription} from "rxjs";
import {isPlatformBrowser, KeyValuePipe} from "@angular/common";
import {MobileHeaderComponent} from "../../shared/components/core/mobile-header/mobile-header.component";
import {TrackingHeaderComponent} from "./tracking-header/tracking-header.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss',
  standalone: true,
  imports: [
    MobileHeaderComponent,
    TrackingHeaderComponent,
    RouterLink,
    KeyValuePipe
  ]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {

  // Store Data
  order: Order [] = [];
  isLoading: boolean = true;

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];


  ngOnInit(): void {
    // Base data
    if (isPlatformBrowser(this.platformId)) {
      this.getAllOrder();
    }
  }


  /**
   * HANDLE HTTP Req
   * getAllOrder()
   */

  private getAllOrder() {
    const filterData: FilterData = {
      filter: null,
      pagination: null,
      select: {
        name: 1,
        type: 1,
        images: 1,
        grandTotal: 1,
        orderId: 1,
        createdAt: 1,
        orderedItems: 1,
        orderTimeline: 1,
        orderStatus: 1,
      },
      sort: {priority: -1}
    };
    const subscription = this.orderService.getAllOrder(filterData,null).subscribe({
      next: (res) => {
        this.order = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = true;
      },
    });
    this.subscriptions?.push(subscription);
  }


  getStatusMessage(key: unknown): string  {
    if (typeof key === 'string') {
      return `Status: ${key}`;
    }
    return 'Unknown Status';
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
