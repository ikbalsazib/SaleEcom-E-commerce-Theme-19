import {Component, Input} from '@angular/core';
import {SafeHtmlCustomPipe} from "../../pipes/safe-html.pipe";
import {NgClass, NgStyle} from "@angular/common";

@Component({
  selector: 'app-product-details-description',
  imports: [
    SafeHtmlCustomPipe,
    NgStyle,
    NgClass
  ],
  templateUrl: './product-details-description.component.html',
  styleUrl: './product-details-description.component.scss',
  standalone: true,
})
export class ProductDetailsDescriptionComponent {
  @Input() data: any;
  isExpanded:boolean = false;

  toggleReadMore() {
    this.isExpanded = !this.isExpanded;
  }
}
