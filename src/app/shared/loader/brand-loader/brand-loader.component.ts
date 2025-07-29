import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-brand-loader',
  standalone: true,
    imports: [
        NgxSkeletonLoaderModule
    ],
  templateUrl: './brand-loader.component.html',
  styleUrl: './brand-loader.component.scss'
})
export class BrandLoaderComponent {

}
