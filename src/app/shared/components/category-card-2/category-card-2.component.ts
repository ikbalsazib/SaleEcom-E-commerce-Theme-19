import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";
import {JsonPipe, NgOptimizedImage} from "@angular/common";
import {ImgCtrlPipe} from "../../pipes/img-ctrl.pipe";
import {ArrayToSingleImagePipe} from "../../pipes/array-to-single-image.pipe";
import {Category} from "../../../interfaces/common/category.interface";

@Component({
  selector: 'app-category-card-2',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    ImgCtrlPipe,
    ArrayToSingleImagePipe,
    JsonPipe
  ],
  templateUrl: './category-card-2.component.html',
  styleUrl: './category-card-2.component.scss'
})
export class CategoryCard2Component {
  // Decorator
  @Input() category: any;

  // Store Data
  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '128w, 384w';
}
