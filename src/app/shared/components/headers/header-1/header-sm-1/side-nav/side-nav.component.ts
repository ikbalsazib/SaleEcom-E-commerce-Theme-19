import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  imports: [
    RouterLink,
    NgForOf,
    NgIf,
    MatIcon
  ],
  standalone: true
})
export class SideNavComponent {
  @Input() shopInfo: any;
  @Input() categoryMenus: any;

  @Output() categoryClosed = new EventEmitter<void>();

  categorySlide = false;
  toggleSub: string | null = null;
  toggleChild: string | null = null;

  onShowCategory() {
    this.categorySlide = true;
  }

  onHideCategory() {
    this.categorySlide = false;
    this.toggleSub = null;
    this.toggleChild = null;
    this.categoryClosed.emit();
  }

  showSub(id: string) {
    this.toggleSub = this.toggleSub === id ? null : id;
    this.toggleChild = null; // Reset child toggle
  }

  showChild(id: string) {
    this.toggleChild = this.toggleChild === id ? null : id;
  }

  ngOnDestroy(): void {
    // if (this.subDataOne) {
    //   this.subDataOne.unsubscribe();
    // }
  }
}
