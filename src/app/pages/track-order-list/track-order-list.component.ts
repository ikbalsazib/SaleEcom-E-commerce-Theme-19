import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Order} from "../../interfaces/common/order.interface";
import {OrderService} from "../../services/common/order.service";
import {Subscription} from "rxjs";
import {isPlatformBrowser, NgClass} from "@angular/common";
import {FilterData} from "../../interfaces/core/filter-data";
import {SingleOrderComponent} from "../../shared/components/single-order/single-order.component";
import {OrderLoaderComponent} from "../../shared/loader/order-loader/order-loader.component";
import {EmptyDataComponent} from "../../shared/components/ui/empty-data/empty-data.component";
import {TrackSingleOrderComponent} from "../../shared/components/track-single-order/track-single-order.component";

@Component({
  selector: 'app-track-order-list',
  templateUrl: './track-order-list.component.html',
  styleUrl: './track-order-list.component.scss',
  standalone: true,
  imports: [
    NgClass,
    SingleOrderComponent,
    OrderLoaderComponent,
    EmptyDataComponent,
    TrackSingleOrderComponent
  ]
})
export class TrackOrderListComponent implements OnInit, OnDestroy {

  // Store Data
  selectedStatus: string = 'All';
  order: Order[] = [];
  isLoading: boolean = true;
  filter: any = null;

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getAllOrder();
    }
  }

  /**
   * HTTP Request Handle
   * getAllOrder()
   */
  private getAllOrder() {
    const filterData: FilterData = {
      filter: this.filter,
      pagination: null,
      select: {
        name: 1,
        type: 1,
        images: 1,
        grandTotal: 1,
        orderId: 1,
        createdAt: 1,
        orderedItems: 1,
        orderStatus: 1,
      },
      sort: { createdAt: -1 }
    };
    const subscription = this.orderService.getAllOrder(filterData, null).subscribe({
      next: (res) => {
        this.order = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = true;
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * UI Logic
   * selectStatus()
   */
  selectStatus(status: string) {
    this.selectedStatus = status;
    this.filter = status === 'All' ? null : { orderStatus: status };
    this.getAllOrder();
  }

  /**
   * ON Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
