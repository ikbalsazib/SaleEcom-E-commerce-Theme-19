import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'app-star-rating-view',
  standalone: true,
  imports: [],
  templateUrl: './star-rating-view.component.html',
  styleUrl: './star-rating-view.component.scss'
})
export class StarRatingViewComponent implements  OnChanges{
  // Decorator
  @Input() rating: number = 0;
  @Input() starSize: string = '24px';
  @Input() color: string = '#f5c518';

  // Store Data
  stars: boolean[] = Array(5).fill(false);

  ngOnChanges() {
    this.stars = this.stars.map((_, index) => index < this.rating);
  }
}
