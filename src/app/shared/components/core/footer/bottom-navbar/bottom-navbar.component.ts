import { Component, HostListener, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ShopInformation } from '../../../../../interfaces/common/shop-information.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './bottom-navbar.component.html',
  styleUrl: './bottom-navbar.component.scss',
})
export class BottomNavbarComponent {
  // Decorator
  @Input() currentUrl: string;
  @Input() shopInfo: ShopInformation;
  @Input() chatLink: any;
  // Store Data
  chatStyle: boolean = false;

  /**
   * Other Methods
   * isVisible
   * getSocialLink()
   * onClick()
   * chatOpen()
   **/
  get isVisible() {
    return (
      !['/cart', '/checkout', '/easy-checkout'].includes(this.currentUrl) &&
      !this.currentUrl.startsWith('/product-details/')
    );
  }


  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.chat')) {
      this.chatStyle = false;
    }
  }

  chatOpen() {
    this.chatStyle = !this.chatStyle;
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : 'auto';
  }
}
