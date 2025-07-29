import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-product-details-right-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './product-details-right-loader.component.html',
  styleUrl: './product-details-right-loader.component.scss'
})
export class ProductDetailsRightLoaderComponent {

}
