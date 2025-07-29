import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-banner-loader-one',
  standalone: true,
    imports: [
        NgxSkeletonLoaderModule
    ],
  templateUrl: './banner-loader-one.component.html',
  styleUrl: './banner-loader-one.component.scss'
})
export class BannerLoaderOneComponent {

}
