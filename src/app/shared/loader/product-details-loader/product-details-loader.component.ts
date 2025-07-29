import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-product-details-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './product-details-loader.component.html',
  styleUrl: './product-details-loader.component.scss'
})
export class ProductDetailsLoaderComponent {

}
