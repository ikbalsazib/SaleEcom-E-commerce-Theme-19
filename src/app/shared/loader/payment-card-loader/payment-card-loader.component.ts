import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-payment-card-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './payment-card-loader.component.html',
  styleUrl: './payment-card-loader.component.scss'
})
export class PaymentCardLoaderComponent {

}
