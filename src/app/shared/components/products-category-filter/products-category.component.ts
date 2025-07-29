import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {RouterLink} from "@angular/router";


@Component({
  selector: 'app-products-category-filter',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './products-category.component.html',
  styleUrl: './products-category.component.scss'
})
export class ProductsCategoryComponent implements OnChanges {
  @Input() data:any;
  @Input() activeFilters: string[] = [];
  activeData: string;

  @Output() resetFilters = new EventEmitter<void>();
  @Output() selectedFilters = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (this.activeFilters.length) {
      this.activeData = this.activeFilters[0];
    } else {
      this.activeData = null;
    }
  }

  onResetFilters() {
    this.resetFilters.emit();
  }
  onSelectedFilters() {
    this.selectedFilters.emit();
  }

  // checkActiveFilter(slug: string) {
  //   const fIndex = this.activeFilters.indexOf(slug);
  //   return fIndex > -1;
  // }
}
