import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-shipping-address-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './shipping-address-loader.component.html',
  styleUrl: './shipping-address-loader.component.scss'
})
export class ShippingAddressLoaderComponent {

}
