import {Component, HostListener, inject, Input, PLATFORM_ID} from '@angular/core';
import {ReloadService} from "../../../services/core/reload.service";
import {isPlatformBrowser, NgClass, NgIf, ViewportScroller} from "@angular/common";
import {CurrencyCtrPipe} from "../../../shared/pipes/currency.pipe";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-why-buy-product',
  templateUrl: './why-buy-product.component.html',
  styleUrl: './why-buy-product.component.scss',
  imports: [
    NgIf,
    CurrencyCtrPipe,
    NgClass,
    TranslatePipe
  ],
  standalone: true
})
export class WhyBuyProductComponent {
  @Input() singleLandingPage: any;
  selectedMenu = 0;

  imageVisible = false;
  textVisible = false;
  @Input() cartSaleSubTotal: any;

  private readonly reloadService = inject(ReloadService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly platformId = inject(PLATFORM_ID);
  /**
   * SCROLL WITH NAVIGATE
   * onScrollWithNavigate()
   */

  public onScrollWithNavigate(type: string) {
    switch (true) {
      case type === "payment":
        this.selectedMenu = 1;
        this.reloadService.needRefreshSticky$(true);
        break;
      default:
        this.selectedMenu = 0;
    }
  }

  @HostListener('window:scroll')
  scrollBody() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the footer's Y offset position
      const [_, footerTop] = this.viewportScroller.getScrollPosition();
      const windowHeight = window.innerHeight;
      const footerOffsetTop = document.getElementById('buy')?.offsetTop || 0;

      if (window.scrollY + windowHeight >= footerOffsetTop) {
        this.imageVisible = true;
        this.textVisible = true;
      } else {
        this.imageVisible = false;
        this.textVisible = false;
      }
    }
  }
}
