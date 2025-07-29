import {Component, Input} from '@angular/core';
import {Order} from "../../../interfaces/common/order.interface";
import {DatePipe} from "@angular/common";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-order-details-shippingaddress',
  templateUrl: './order-details-shippingaddress.component.html',
  styleUrl: './order-details-shippingaddress.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyCtrPipe
  ]
})
export class OrderDetailsShippingaddressComponent {
  // Decorator
  @Input() order: Order;


  /**
   * getOfferName
   */
  getOfferName(offerType: string): string {
    if (offerType === 'new-registration') {
      return 'New Registration Offer'
    } else if (offerType === 'online-payment') {
      return 'Online Payment Offer'
    } else {
      return '';
    }
  }

  get formattedDiscount(): string {
    const amount = this.order?.offerDiscount?.amount;
    return typeof amount === 'number' ? amount.toFixed(2) : '';
  }

  protected readonly Number = Number;
}
