import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-products-card-banner',
  standalone: true,
  imports: [],
  templateUrl: './products-card-banner.component.html',
  styleUrl: './products-card-banner.component.scss'
})
export class ProductsCardBannerComponent {
  @Input() data:any;
}
