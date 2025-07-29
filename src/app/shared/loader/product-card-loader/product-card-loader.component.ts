import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-product-card-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './product-card-loader.component.html',
  styleUrl: './product-card-loader.component.scss'
})
export class ProductCardLoaderComponent {

}
