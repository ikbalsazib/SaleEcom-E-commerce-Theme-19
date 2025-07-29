import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-list-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './list-loader.component.html',
  styleUrl: './list-loader.component.scss'
})
export class ListLoaderComponent {

}
