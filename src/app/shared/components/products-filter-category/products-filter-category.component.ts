import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-products-filter-category',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './products-filter-category.component.html',
  styleUrl: './products-filter-category.component.scss'
})
export class ProductsFilterCategoryComponent {
  @Input() data:any;
}
