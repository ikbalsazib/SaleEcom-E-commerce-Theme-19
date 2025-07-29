import {NgForOf} from '@angular/common';
import {Component} from '@angular/core';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';

@Component({
  selector: 'app-category-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
    NgForOf
  ],
  templateUrl: './category-loader.component.html',
  styleUrl: './category-loader.component.scss'
})
export class CategoryLoaderComponent {

}
