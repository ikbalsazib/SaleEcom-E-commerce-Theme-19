import { Component, inject, Input, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FilterData } from "../../interfaces/core/filter-data";
import { OrderService } from "../../services/common/order.service";
import { Order } from "../../interfaces/common/order.interface";
import { Subscription } from "rxjs";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-pending-review',
  templateUrl: './pending-review.component.html',
  styleUrl: './pending-review.component.scss',
  standalone: true,
  imports: [RouterModule],
})
export class PendingReviewComponent implements OnInit, OnDestroy {

  // Decorator
  @Input() product: any;

  // Store Data
  orders: Order[] = [];
  newOrders: any[] = [];

  // Inject
  private readonly orderService = inject(OrderService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Fetch data if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.getAllOrder();
    }
  }


  /**
   * HTTP REQUEST HANDLE
   * getAllOrder()
   */
  private getAllOrder() {
    const filterData: FilterData = {
      filter: { orderStatus: 'Delivered' },
      pagination: null,
      select: {
        name: 1, type: 1, images: 1, grandTotal: 1,
        orderId: 1, createdAt: 1, orderedItems: 1, orderStatus: 1
      },
      sort: { priority: -1 }
    };
    const subscription = this.orderService.getAllOrder(filterData, null).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.newArray(this.orders);
      },
      error: (err) => {}
    });
    this.subscriptions?.push(subscription);
  }

  /**
   * OTHER METHODS
   * newArray()
   */
  private newArray(orders: any) {
    const newArray = [];

    orders.forEach(order => {
      order.orderedItems.forEach(item => {
        if (!item.isReview) { // Only add if isReview is false
          newArray.push({
            order_Id: order._id,
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            orderDeliveryDate: order.deliveryDate,
            orderGrandTotal: order.grandTotal,
            orderCreatedAt: order.createdAt,
            productId: item.product,
            productName: item.name,
            productSlug: item.slug || null,
            productImage: item.image,
            salePrice: item.salePrice,
            regularPrice: item.regularPrice,
            selectedQuantity: item.selectedQuantity,
            discountType: item.discountType,
            discountAmount: item.discountAmount,
            categoryName: item.category.name,
            categorySlug: item.category.slug,
            specifications: item.specifications,
            brandSlug: item.brand ? item.brand.slug : null,
            variationName: item.variation ? item.variation.name : null,
            variationDiscountType: item.variation ? item.variation.discountType : null,
            variationSalePrice: item.variation ? item.variation.salePrice : null
          });
        }
      });
    });
    this.newOrders = newArray;
  }


  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
