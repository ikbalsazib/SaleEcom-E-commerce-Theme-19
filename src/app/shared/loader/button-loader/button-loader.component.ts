import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'app-button-loader',
  standalone: true,
    imports: [
        NgForOf,
        NgxSkeletonLoaderModule
    ],
  templateUrl: './button-loader.component.html',
  styleUrl: './button-loader.component.scss'
})
export class ButtonLoaderComponent {

}
