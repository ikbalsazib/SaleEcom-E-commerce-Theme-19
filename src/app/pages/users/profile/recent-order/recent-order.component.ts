import {Component, inject, OnInit, OnDestroy, PLATFORM_ID} from '@angular/core';
import { FilterData } from "../../../../interfaces/core/filter-data";
import { Order } from "../../../../interfaces/common/order.interface";
import { OrderService } from "../../../../services/common/order.service";
import { Subscription } from "rxjs";
import { Pagination } from "../../../../interfaces/core/pagination";
import {isPlatformBrowser} from "@angular/common";
import {SingleOrderComponent} from "../../../../shared/components/single-order/single-order.component";
import {OrderLoaderComponent} from "../../../../shared/loader/order-loader/order-loader.component";
import {EmptyDataComponent} from "../../../../shared/components/ui/empty-data/empty-data.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-recent-order',
  templateUrl: './recent-order.component.html',
  styleUrl: './recent-order.component.scss',
  standalone: true,
  imports: [
    SingleOrderComponent,
    OrderLoaderComponent,
    EmptyDataComponent,
    RouterLink
  ]
})
export class RecentOrderComponent implements OnInit, OnDestroy {

  // Store Data
  orders: Order[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  productsPerPage = 2;
  totalProducts = 0;
  totalProductsStore = 0;

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly platformId = inject(PLATFORM_ID);
  private filter: any = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getAllOrder();
      setTimeout(() => this.isLoading = false, 100);
    }
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllOrder
   */
  private getAllOrder(): void {
    const pagination: Pagination = {
      pageSize: this.productsPerPage,
      currentPage: this.currentPage - 1
    };

    const filterData: FilterData = {
      filter: this.filter,
      pagination: pagination,
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
      next: res => {
        this.orders = res.data;
        this.isLoading = false;
      }
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
