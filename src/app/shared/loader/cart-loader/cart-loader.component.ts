import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-cart-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
    NgForOf
  ],
  templateUrl: './cart-loader.component.html',
  styleUrl: './cart-loader.component.scss'
})
export class CartLoaderComponent {

}
