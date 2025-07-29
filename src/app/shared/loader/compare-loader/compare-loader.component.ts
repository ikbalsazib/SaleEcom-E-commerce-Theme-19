import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-compare-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './compare-loader.component.html',
  styleUrl: './compare-loader.component.scss'
})
export class CompareLoaderComponent {

}
