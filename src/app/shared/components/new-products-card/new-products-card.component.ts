import {Component, Input} from '@angular/core';
import {PricePipe} from "../../pipes/price.pipe";
import {RouterLink} from "@angular/router";
import {StarRatingViewComponent} from '../star-rating-view/star-rating-view.component';
import {CurrencyCtrPipe} from "../../pipes/currency.pipe";

@Component({
  selector: 'app-new-products-card',
  standalone: true,
  imports: [
    PricePipe,
    RouterLink,
    StarRatingViewComponent,
    CurrencyCtrPipe
  ],
  templateUrl: './new-products-card.component.html',
  styleUrl: './new-products-card.component.scss'
})
export class NewProductsCardComponent {
  @Input() data:any;


  /**
   * Calculate
   * ratingCount()
   */
  get ratingCount(): number {
    if (this.data) {
      return Math.floor((this.data?.ratingTotal ?? 0) / (this.data?.ratingCount ?? 0));
    } else {
      return 0;
    }
  }
}
