import {Component, Input} from '@angular/core';
import {Order} from "../../../interfaces/common/order.interface";
import {RouterLink} from "@angular/router";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-order-details-products',
  templateUrl: './order-details-products.component.html',
  styleUrl: './order-details-products.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyCtrPipe
  ]
})
export class OrderDetailsProductsComponent {
  // Decorator
  @Input() order: Order | null = null;
}
