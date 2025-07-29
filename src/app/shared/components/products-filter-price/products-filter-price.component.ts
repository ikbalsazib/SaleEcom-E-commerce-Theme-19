import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatSlider, MatSliderRangeThumb} from "@angular/material/slider";

@Component({
  selector: 'app-products-filter-price',
  standalone: true,
  imports: [
    FormsModule,
    MatSlider,
    MatSliderRangeThumb
  ],
  templateUrl: './products-filter-price.component.html',
  styleUrl: './products-filter-price.component.scss'
})
export class ProductsFilterPriceComponent {
  // Decorator
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();

  // Price
  lowValue: number = 0;
  highValue: number = null;

  onLowChange(event: number) {
    this.lowValue = event
  }

  onHighChange(event: number) {
    this.highValue = event
  }
  onPriceRangeChange() {
    if (this.highValue > 0) {
      const range = {salePrice: {$gt: this.lowValue, $lt: this.highValue}};
      this.dataEmitter.emit(range);
    }

  }
}
