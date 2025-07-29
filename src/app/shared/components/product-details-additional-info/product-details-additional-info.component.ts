import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-product-details-additional-info',
  standalone: true,
  imports: [],
  templateUrl: './product-details-additional-info.component.html',
  styleUrl: './product-details-additional-info.component.scss'
})

export class ProductDetailsAdditionalInfoComponent {
  @Input() data:any;
}
