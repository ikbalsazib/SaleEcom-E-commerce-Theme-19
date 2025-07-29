import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-category-loader-2',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
    NgForOf
  ],
  templateUrl: './category-loader-2.component.html',
  styleUrl: './category-loader-2.component.scss'
})
export class CategoryLoader2Component {

}
