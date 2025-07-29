import {Component, inject, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {StarRatingViewComponent} from '../star-rating-view/star-rating-view.component';
import {Review} from '../../../interfaces/common/review.interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-product-rating-card',
  standalone: true,
  imports: [
    DatePipe,
    StarRatingViewComponent
  ],
  templateUrl: './product-rating-card.component.html',
  styleUrl: './product-rating-card.component.scss'
})
export class ProductRatingCardComponent {

  // Decorator
  @Input() data: Review;

  // Gallery View
  isGalleryOpen: boolean = false;
  galleryImages: string[] = [];
  selectedImageIndex: number = 0;

  // Inject
  private readonly router = inject(Router);


  /**
   * Dialog Component
   * openAddressDialog()
   */

  openGallery(event: any, images: string[], index?: number): void {
    event.stopPropagation();

    if (index) {
      this.selectedImageIndex = index;
    }
    this.galleryImages = images;
    this.isGalleryOpen = true;
    this.router.navigate([], {queryParams: {'gallery-image-view': true}, queryParamsHandling: 'merge'}).then();
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.router.navigate([], {queryParams: {'gallery-image-view': null}, queryParamsHandling: 'merge'}).then();
  }


}
