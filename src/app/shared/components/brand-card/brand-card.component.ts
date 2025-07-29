import {Component, Input} from '@angular/core';
import {ArrayToSingleImagePipe} from "../../pipes/array-to-single-image.pipe";
import {ImgCtrlPipe} from "../../pipes/img-ctrl.pipe";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [
    ArrayToSingleImagePipe,
    ImgCtrlPipe,
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './brand-card.component.html',
  styleUrl: './brand-card.component.scss'
})
export class BrandCardComponent {
  // Decorator
  @Input() data: any = null;

  // Store Data
  /**
   * Usage Guide
   * sizes="(max-width: 599px) 16px, (min-width: 600px) 48px"
   * If with 16px then take the next src near 16w
   */
  protected readonly rawSrcset: string = '128w, 384w';
}
