import {Component, inject, Input} from '@angular/core';
import {OrderService} from "../../../services/common/order.service";
import {ShopInformation} from "../../../interfaces/common/shop-information.interface";
import {Order} from "../../../interfaces/common/order.interface";
import {Subscription} from "rxjs";
import {NgClass, TitleCasePipe} from "@angular/common";

@Component({
  selector: 'app-recent-order',
  templateUrl: './recent-order.component.html',
  styleUrl: './recent-order.component.scss',
  imports: [
    NgClass,
    TitleCasePipe
  ],
  standalone: true
})
export class RecentOrderComponent {

// Decorator
  @Input() shopInfo: ShopInformation;
  isHomeRoute: boolean = false;
  isBrowser: boolean;
  // Store Data
  protected readonly rawSrcset: string = '384w, 640w';

  domain: string = '';

  page = 1;
  limit = 10;
  isLoading = false;
  hasMoreData = true;

  // Store Data
  orders: Order[] = [];

  // isLoading: boolean = true;

  // Inject
  private readonly orderService = inject(OrderService);

  // Subscription
  private subscriptions: Subscription[] = [];




  ngOnInit() {
    // Base Data
    // this.getAllOrders();
    this.loadOrders();
  }
  /**
   * HTTP Request Handle
   * getAllCategory()
   **/
  // private getAllOrders() {
  //   const subscription = this.orderService.getAllOrders().subscribe({
  //     next: (res) => {
  //       this.orders = res.data;
  //       console.log('this.orders',this.orders)
  //       this.isLoading = false;
  //     },
  //     error: () => {
  //       this.isLoading = false;
  //     },
  //   });
  //   this.subscriptions?.push(subscription);
  // }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.isLoading || !this.hasMoreData) return;
      this.page++;
      this.loadOrders();
    }
  }


  loadOrders() {
    this.isLoading = true;
    this.orderService.getAllOrders(this.page, this.limit).subscribe({
      next: (res) => {
        if (res.data.length < this.limit) {
          this.hasMoreData = false;
        }
        this.orders = [...this.orders, ...res.data];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

}
