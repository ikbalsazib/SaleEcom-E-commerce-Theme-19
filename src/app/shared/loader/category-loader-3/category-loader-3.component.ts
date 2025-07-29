import {NgForOf} from '@angular/common';
import {Component} from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';

@Component({
  selector: 'app-category-loader-3',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
    NgForOf
  ],
  templateUrl: './category-loader-3.component.html',
  styleUrl: './category-loader-3.component.scss'
})
export class CategoryLoader3Component {

}
