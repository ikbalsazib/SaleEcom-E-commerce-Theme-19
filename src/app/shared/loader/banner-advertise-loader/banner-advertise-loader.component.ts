
import {Component} from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';

@Component({
  selector: 'app-banner-advertise-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './banner-advertise-loader.component.html',
  styleUrl: './banner-advertise-loader.component.scss'
})
export class BannerAdvertiseLoaderComponent {

}
