import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";
import {SafeHtmlCustomPipe} from "../../../pipes/safe-html.pipe";
import {DatePipe} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {ImageLoadErrorDirective} from "../../../directives/image-load-error.directive";

@Component({
  selector: 'app-blog-card-one',
  templateUrl: './blog-card-one.component.html',
  styleUrl: './blog-card-one.component.scss',
  imports: [
    RouterLink,
    SafeHtmlCustomPipe,
    DatePipe,
    MatIcon,
    ImageLoadErrorDirective
  ],
  standalone: true
})
export class BlogCardOneComponent {
  @Input() data:any;
}
