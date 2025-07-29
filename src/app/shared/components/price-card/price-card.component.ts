import {Component, Input} from '@angular/core';
import {Pricing} from '../../../interfaces/common/pricing.interface';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-price-card',
  standalone: true,
  templateUrl: './price-card.component.html',
  imports: [
    RouterLink
  ],
  styleUrl: './price-card.component.scss'
})
export class PriceCardComponent {
  @Input({required: true}) data: Pricing;
}
