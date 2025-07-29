import {Component} from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';

@Component({
  selector: 'app-carousel-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './carousel-loader.component.html',
  styleUrl: './carousel-loader.component.scss'
})
export class CarouselComponent {

}
