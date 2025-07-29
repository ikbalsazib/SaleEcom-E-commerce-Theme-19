import { Component } from '@angular/core';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-profile-loader',
  standalone: true,
  imports: [
    NgxSkeletonLoaderModule
  ],
  templateUrl: './profile-loader.component.html',
  styleUrl: './profile-loader.component.scss'
})
export class ProfileLoaderComponent {

}
