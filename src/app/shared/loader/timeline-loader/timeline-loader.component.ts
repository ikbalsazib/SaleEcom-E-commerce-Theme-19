import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-timeline-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './timeline-loader.component.html',
  styleUrl: './timeline-loader.component.scss'
})
export class TimelineLoaderComponent {

}
