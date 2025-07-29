import {Component, Input} from '@angular/core';
import {Order} from "../../../interfaces/common/order.interface";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-order-details-timeline',
  templateUrl: './order-details-timeline.component.html',
  styleUrl: './order-details-timeline.component.scss',
  imports: [
    DatePipe
  ],
  standalone: true
})
export class OrderDetailsTimelineComponent {
  // Decorator
  @Input() order: Order | null = null;
}
