import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-filter-brand',
  templateUrl: './filter-brand.component.html',
  styleUrl: './filter-brand.component.scss'
})
export class FilterBrandComponent implements OnChanges {
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
}
