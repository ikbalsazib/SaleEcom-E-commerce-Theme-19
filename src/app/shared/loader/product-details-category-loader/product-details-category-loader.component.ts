import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-product-details-category-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './product-details-category-loader.component.html',
  styleUrl: './product-details-category-loader.component.scss'
})
export class ProductDetailsCategoryLoaderComponent {

}
