import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-blog-banner',
  templateUrl: './blog-banner.component.html',
  styleUrl: './blog-banner.component.scss',
  imports: [
    RouterLink
  ],
  standalone: true
})
export class BlogBannerComponent {}
