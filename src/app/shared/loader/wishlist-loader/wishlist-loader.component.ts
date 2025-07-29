import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-wishlist-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './wishlist-loader.component.html',
  styleUrl: './wishlist-loader.component.scss',
})
export class WishlistLoaderComponent {

}
