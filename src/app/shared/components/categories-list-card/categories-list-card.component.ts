import { Component, Input } from '@angular/core';
import { Category } from '../../../interfaces/common/category.interface';

@Component({
  selector: 'app-categories-list-card',
  standalone: true,
  imports: [],
  templateUrl: './categories-list-card.component.html',
  styleUrl: './categories-list-card.component.scss'
})
export class CategoriesListCardComponent {
  @Input() category: Category = null;
}
