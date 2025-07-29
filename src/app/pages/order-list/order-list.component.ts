import { Component } from '@angular/core';
import {SingleOrderComponent} from "../../shared/components/single-order/single-order.component";
import {SidebarComponent} from "../../shared/components/sidebar/sidebar.component";
import {MobileHeaderComponent} from "../../shared/components/core/mobile-header/mobile-header.component";
import {AccountSidebarComponent} from "../../shared/components/account-sidebar/account-sidebar.component";
import {EmptyDataComponent} from "../../shared/components/ui/empty-data/empty-data.component";
import {OrderLoaderComponent} from "../../shared/loader/order-loader/order-loader.component";
import {ListOrderComponent} from "./list-order/list-order.component";

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  standalone: true,
  imports: [
    SingleOrderComponent,
    SidebarComponent,
    MobileHeaderComponent,
    AccountSidebarComponent,
    EmptyDataComponent,
    OrderLoaderComponent,
    ListOrderComponent
  ]
})
export class OrderListComponent {}
