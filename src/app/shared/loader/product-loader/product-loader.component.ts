import {Component} from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';

@Component({
  selector: 'app-product-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './product-loader.component.html',
  styleUrl: './product-loader.component.scss'
})
export class ProductLoaderComponent {
}
